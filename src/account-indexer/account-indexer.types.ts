import { Job } from 'bull';

export const ACCOUNT_INDEXER_TOPIC_NAME = 'ACCOUNT_INDEXER_TOPIC';

export const PARENT_PROGRAM_SUBTYPES = [
  'account',
  'metadata',
  'mint',
  'masterEdition',
  'auction',
  'auctionData',
  'escrow',
];

export interface AccountIndexer {
  id: string;
  parentProgram: string;
  parentProgramSubType: string;
  tokens: number;
  callbackTimeMs: number;
  data: {
    img: string;
  };
  version: number;
}

export interface AccountIndexerJob extends Job {
  data: AccountIndexer;
}
