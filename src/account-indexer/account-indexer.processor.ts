import {
  InjectQueue,
  OnQueueCompleted,
  Process,
  Processor,
} from '@nestjs/bull';
import {
  ACCOUNT_INDEXER_TOPIC_NAME,
  AccountIndexerJob,
} from './account-indexer.types';
import { Queue } from 'bull';
import { Logger } from '@nestjs/common';
import { AccountIndexerService } from './account-indexer.service';
import { InjectConnection } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { AccountService } from '../account/account.service';

@Processor(ACCOUNT_INDEXER_TOPIC_NAME)
export class AccountIndexerProcessor {
  private readonly logger: Logger;
  private readonly callbacks: Map<string, NodeJS.Timeout> = new Map();
  private timeout;

  constructor(
    @InjectConnection() private readonly connection: mongoose.Connection,
    private readonly accountIndexerService: AccountIndexerService,
    @InjectQueue(ACCOUNT_INDEXER_TOPIC_NAME) private stakedEventQueue: Queue,
    private readonly accountService: AccountService,
  ) {
    this.logger = new Logger(AccountIndexerService.name);
  }

  private logCallback(
    id: string,
    version: number,
    callbackTimeMs: number,
  ): void {
    if (this.callbacks.has(id)) {
      clearTimeout(this.callbacks.get(id));
    }
    this.callbacks.set(
      id,
      setTimeout(async () => {
        this.logger.log(
          `Callback for account: ${id}, version: ${version} has expired`,
        );
        await this.refreshTimer();
      }, callbackTimeMs),
    );
  }

  @Process()
  async processAccountIndexer({ data }: AccountIndexerJob) {
    const session = await this.connection.startSession();
    try {
      await session.startTransaction();
      const {
        id,
        callbackTimeMs,
        parentProgramSubType,
        parentProgram,
        version,
      } = data;
      const currentVersion = version || 1;
      const pubKey = `${id}-${parentProgramSubType}`;

      const existingAccount =
        await this.accountService.getByIdAndParentProgramSubType(
          id,
          parentProgramSubType,
        );
      if (existingAccount && existingAccount.version >= currentVersion) {
        this.logger.log(
          `Ignored update for older version of account: ${id} in parent program subtype: ${parentProgramSubType} and version: ${currentVersion}, currently synced version: ${existingAccount.version}`,
        );
        return;
      }

      await this.accountService.transactionCreateOrUpdate(data, session);

      await this.accountIndexerService.cancelOldJobs(pubKey, currentVersion);
      this.logCallback(pubKey, currentVersion, callbackTimeMs);

      //Display a short message log message to console when each (pubkey + slot + owner_subtype + write_version) tuple has been indexed.
      //I'm not sure which values should be substituted under pubkey + slot + owner_subtype - so I replaced the ones that seemed most appropriate to me
      this.logger.log(
        `Successful (${id}-${parentProgram}-${parentProgramSubType}-${currentVersion}) tuple has been indexed`,
      );

      await session.commitTransaction();
    } catch (err) {
      this.logger.error(
        `Critical error in process event from queue: ${err.message}`,
      );
      await session.abortTransaction();
    } finally {
      await session.endSession();
    }
  }

  @OnQueueCompleted()
  async refreshTimer(): Promise<void> {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(
      this.accountIndexerService.turnOffIfEmptyQueue.bind(
        this.accountIndexerService,
      ),
      5000,
    );
  }
}
