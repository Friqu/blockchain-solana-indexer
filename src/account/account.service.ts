import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Account, AccountDocument } from './entities/account.entity';
import { ClientSession, Model } from 'mongoose';

@Injectable()
export class AccountService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
  ) {}

  async getByIdAndParentProgramSubType(
    id: string,
    parentProgramSubType: string,
  ): Promise<Account> {
    return this.accountModel
      .findOne({ id, parentProgramSubType })
      .read('primary')
      .lean();
  }

  async transactionCreateOrUpdate(
    data: Partial<AccountDocument>,
    session?: ClientSession,
  ): Promise<Account> {
    const { id, parentProgramSubType } = data;
    let options = {};

    if (session) {
      options = { session };
    }

    return this.accountModel
      .findOneAndUpdate(
        { id, parentProgramSubType },
        { $set: data },
        { ...options, upsert: true },
      )
      .lean();
  }

  async getHighestTokenAccountByParentProgramSubtype(
    parentProgramSubType: string,
  ): Promise<Account> {
    return this.accountModel
      .findOne({ parentProgramSubType })
      .sort({ tokens: -1 })
      .lean();
  }
}
