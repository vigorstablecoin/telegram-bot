import { ContextMessageUpdate } from "telegraf"
import { withUserType } from "./bot/middlewares/withUser"

export enum NOTIFICATION_LEVEL {
  NONE, // never notify
  IMPORTANT,
  ALL,
}

export type TProposalsRow = {
  modifieddate: number
  transactionid: string
  proposalname: string
}

export type ExtendedContextMessageUpdate = ContextMessageUpdate & withUserType