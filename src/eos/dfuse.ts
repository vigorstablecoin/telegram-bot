import { createDfuseClient } from '@dfuse/client'
import nodeFetch from 'node-fetch'
import WebSocketClient from 'ws'
import { IncomingMessage } from 'http'

const { DFUSE_API_KEY, EOS_NETWORK } = process.env

if (!DFUSE_API_KEY) {
    throw new Error(`No dfuse API key in env variable "DFUSE_API_KEY" set`)
}

const network = EOS_NETWORK || 'mainnet';

(global as any).WebSocket = WebSocketClient

const client = createDfuseClient({
    apiKey: DFUSE_API_KEY,
    network,
    httpClientOptions: {
        fetch: nodeFetch
    },
})

export default client
