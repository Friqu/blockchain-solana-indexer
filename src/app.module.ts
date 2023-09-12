import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccountIndexerModule } from './account-indexer/account-indexer.module';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountModule } from './account/account.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        return {
          uri: config.get<string>('MONGO_CONNECTION'),
          dbName: config.get<string>('MONGO_TABLE'),
          retryAttempts: 5,
          retryDelay: 10,
          useNewUrlParser: true,
          ignoreUndefined: true,
        };
      },
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        createClient: (type, redisOpts) => {
          return new Redis(configService.get('REDIS_URL'), {
            ...redisOpts,
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
          });
        },
      }),
      inject: [ConfigService],
    }),
    AccountIndexerModule,
    AccountModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
