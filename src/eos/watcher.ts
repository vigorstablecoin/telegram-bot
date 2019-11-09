import {
  DfuseClient,
  SearchTransactionRow,
  ActionTrace,
} from '@dfuse/client'
import Config from '../entity/Config'
import { logger } from '../logger'
import { TEosAction } from './types'
import { sleep, isProduction } from '../utils'
import onAction from '../bot/on-action'
import { DAC_MULTI_SIG_ACCOUNT } from '../constants'
import { fetchHeadBlockNumber } from './fetch'

const MAX_BLOCK_RANGE_PER_SEARCH = 7200 * 12 // 12 hours
// we don't to spam people, so only look this far back if bot crashed and is restarted at some point
const MAX_PAST_LOOKUP = isProduction() ? 7200 * 1 : 7200 * 3

const ACCOUNT_TO_WATCH = DAC_MULTI_SIG_ACCOUNT

const isMatchingTrace = (trace: ActionTrace<any>) => {
  if (trace.receipt.receiver !== ACCOUNT_TO_WATCH) return false

  // only internal actions, no token transfers etc.
  return trace.act.account === ACCOUNT_TO_WATCH;
}

const getActionTraces = (trans: SearchTransactionRow): TEosAction[] => {
  const matchingTraces = []
  const blockNumber = trans.lifecycle.execution_trace!.block_num

  // BFS through transaction traces
  const traces = trans.lifecycle.execution_trace!.action_traces
  while (traces.length > 0) {
    const curTrace = traces.shift()!

    if (isMatchingTrace(curTrace)) {
      matchingTraces.push(curTrace)
      logger.info(
        `Pending ${curTrace.act.account}:${curTrace.act.name} @ ${blockNumber}`,
      )
    }

    if (Array.isArray(curTrace.inline_traces)) {
      traces.push(...curTrace.inline_traces)
    }
  }

  return matchingTraces.map(trace => {
    return {
      blockNumber: trans.lifecycle.execution_trace!.block_num,
      timestamp: trans.lifecycle.execution_block_header.timestamp,
      account: trace.act.account,
      name: trace.act.name,
      data: trace.act.data,
      print: trace.console,
    }
  })
}

class Watcher {
  private client: DfuseClient
  private config?: Config

  private pendingActions: TEosAction[] = []

  constructor(client: DfuseClient) {
    this.client = client
  }

  public async start() {
    this.config = await Config.findOneOrFail({ id: 0 })
    let headBlockNumber = await fetchHeadBlockNumber()
    const diffToConfig = headBlockNumber - this.config.lastCommittedBlockNumber
    logger.info(
      `Block number - Head: ${headBlockNumber} - Config: ${
      this.config.lastCommittedBlockNumber
      } - Diff: ${diffToConfig}`,
    )

    let fromBlock = Math.max(
      this.config.lastCommittedBlockNumber,
      headBlockNumber - MAX_PAST_LOOKUP,
    )
    logger.info(`Watcher starting at ${fromBlock}`)

    while (true) {
      headBlockNumber = await fetchHeadBlockNumber()
      const toBlock = Math.min(headBlockNumber, fromBlock + MAX_BLOCK_RANGE_PER_SEARCH)
      await this.getPendingActions(fromBlock, toBlock)
      await this.commit(toBlock)
      fromBlock = this.config.lastCommittedBlockNumber + 1

      if (toBlock === headBlockNumber) {
        await sleep(10000)
      }
    }
  }



  protected async getPendingActions(fromBlock: number, toBlock: number) {
    const transactions = []
    let response
    let cursor = ``
    do {
      try {
        response = await this.client.searchTransactions(
          `receiver:${ACCOUNT_TO_WATCH}`,
          {
            limit: 100,
            sort: `asc`,
            cursor,
            startBlock: fromBlock,
            blockCount: toBlock - fromBlock,
          },
        )
      } catch (error) {
        let message = error.message
        if (error.details && error.details.errors) message = `${message}. ${JSON.stringify(error.details.errors)}`
        logger.error(`An error occurred: ${message}`)
        // try again
        await sleep(10000)
        continue
      }

      cursor = response.cursor

      if (response.transactions && response.transactions[0]) {
        transactions.push(...response.transactions)
      }
    } while (cursor !== ``)

    transactions.forEach((trans) => {
      const actions = getActionTraces(trans)
      this.pendingActions.push(...actions)
    })
  }

  private async commit(blockNum: number) {
    logger.verbose(`Committing all actions up to block ${blockNum}`)

    while (this.pendingActions.length > 0) {
      const action = this.pendingActions.shift()
      await onAction(action)
    }

    this.config!.lastCommittedBlockNumber = blockNum

    // don't save in dev mode to make testing easier
    if(isProduction()) {
      await Config.save(this.config!)
    }
  }
}

export default Watcher
