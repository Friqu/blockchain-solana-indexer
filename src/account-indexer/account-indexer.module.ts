import { Module } from '@nestjs/common';
import { AccountIndexerService } from './account-indexer.service';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import { AccountIndexerProcessor } from './account-indexer.processor';
import { AccountModule } from '../account/account.module';
import { ACCOUNT_INDEXER_TOPIC_NAME } from './account-indexer.types';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    BullModule.registerQueue({
      name: ACCOUNT_INDEXER_TOPIC_NAME,
    }),
    AccountModule,
  ],
  providers: [AccountIndexerService, AccountIndexerProcessor],
  exports: [AccountIndexerService],
})
export class AccountIndexerModule {}
