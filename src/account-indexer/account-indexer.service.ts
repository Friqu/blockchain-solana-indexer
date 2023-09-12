import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectQueue, OnQueueCompleted } from '@nestjs/bull';
import { Queue } from 'bull';
import {
  ACCOUNT_INDEXER_TOPIC_NAME,
  AccountIndexer,
  PARENT_PROGRAM_SUBTYPES,
} from './account-indexer.types';
import * as fs from 'fs';
import { AccountService } from '../account/account.service';

@Injectable()
export class AccountIndexerService implements OnApplicationBootstrap {
  private readonly logger: Logger;

  constructor(
    @InjectQueue(ACCOUNT_INDEXER_TOPIC_NAME) private indexerQueue: Queue,
    private readonly accountService: AccountService,
  ) {
    this.logger = new Logger(AccountIndexerService.name);
  }

  //A connection to the Solana stream should be created here, but within this function there is an example of a stream
  async onApplicationBootstrap() {
    try {
      const jsonData = await fs.promises.readFile(
        './src/stream-data.json',
        'utf8',
      );
      const accounts = JSON.parse(jsonData);
      for (const accountData of accounts) {
        await new Promise((resolve) =>
          setTimeout(resolve, Math.random() * 1000),
        );
        await this.addJob(ACCOUNT_INDEXER_TOPIC_NAME, accountData);
      }
      return accounts;
    } catch (err) {
      this.logger.error(
        `Critical error in reading fake stream data from file: ${err.message}`,
      );
    }
  }

  async addJob(topic: string, event: AccountIndexer): Promise<void> {
    try {
      await this.indexerQueue.add(event);
    } catch (err) {
      this.logger.error(`Error when adding a task to the queue`, err.message);
    }
  }

  async cancelOldJobs(id: string, version: number): Promise<void> {
    const jobs = await this.indexerQueue.getJobs(['waiting', 'delayed'], 0, -1);
    const oldJobs = jobs.filter((job) => {
      return job.data.id === id && job.data.version < version;
    });

    for (const job of oldJobs) {
      await job.remove();
      this.logger.warn(
        `A task ${id} version: ${job.data.version} has been canceled - a newer version ${version} has been synchronized`,
      );
    }
  }

  async logHighestTokenAccount() {
    await Promise.all(
      PARENT_PROGRAM_SUBTYPES.map(async (subType) => {
        const account =
          await this.accountService.getHighestTokenAccountByParentProgramSubtype(
            subType,
          );
        if (!account) {
          this.logger.debug(
            `No account found in the parent program subtype:${subType}`,
          );
          return;
        }

        const { id, tokens, parentProgramSubType } = account;
        this.logger.debug(
          `user:${id} has the highest token value:${tokens} in the parent program subtype:${parentProgramSubType}`,
        );
      }),
    );
  }

  @OnQueueCompleted()
  async turnOffIfEmptyQueue(): Promise<void> {
    const jobs = await this.indexerQueue.getJobs(['waiting', 'delayed'], 0, -1);
    if (jobs.length === 0) {
      await this.logHighestTokenAccount();
      this.logger.debug(`The queue is empty the system will be shut down`);
      await this.indexerQueue.close();
      process.exit(200);
    }
  }
}
