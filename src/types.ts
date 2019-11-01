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