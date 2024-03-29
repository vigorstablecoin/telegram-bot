export interface IEOSNetwork {
  chainId: string;
  nodeEndpoint: string;
  protocol: string;
  host: string;
  port: number;
}

export type GetChainInfoResult = {
  server_version: string;
  chain_id: string;
  head_block_num: number;
  last_irreversible_block_num: number;
  last_irreversible_block_id: string;
  head_block_id: string;
  head_block_time: string;
  head_block_producer: string;
  virtual_block_cpu_limit: number;
  virtual_block_net_limit: number;
  block_cpu_limit: number;
  block_net_limit: number;
  server_version_string: string;
  fork_db_head_block_num: number;
  fork_db_head_block_id: string;
};

export type TEosAction = {
  blockNumber: number,
  timestamp: string,
  account: string,
  name: string,
  data: any,
  print: string,
}