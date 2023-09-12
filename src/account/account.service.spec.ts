import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AccountService } from './account.service';
import { Model } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import {
  Account,
  AccountDocument,
  AccountSchema,
} from './entities/account.entity';

describe('AccountService', () => {
  let accountService: AccountService;
  let accountModel: Model<AccountDocument>;
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const mongoUri = mongod.getUri();

    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        {
          provide: getModelToken(Account.name),
          useFactory: () => mongoose.model(Account.name, AccountSchema),
        },
      ],
    }).compile();

    accountService = module.get<AccountService>(AccountService);
    accountModel = module.get<Model<AccountDocument>>(
      getModelToken(Account.name),
    );
  });

  afterEach(async () => {
    await accountModel.deleteMany({});
    jest.clearAllMocks();
  });

  describe('getByIdAndParentProgramSubType', () => {
    it('should find an account by id and parentProgramSubType', async () => {
      const mockAccount = {
        id: 'mockId',
        parentProgram: 'mockParentProgram',
        parentProgramSubType: 'mockParentProgramSubType',
        tokens: 100,
        version: 1,
      };

      const createdAccount = await accountModel.create(mockAccount);

      const result = await accountService.getByIdAndParentProgramSubType(
        'mockId',
        'mockParentProgramSubType',
      );

      const expectedAccount = {
        __v: result.__v,
        _id: result._id,
        id: createdAccount.id,
        parentProgram: createdAccount.parentProgram,
        parentProgramSubType: createdAccount.parentProgramSubType,
        tokens: createdAccount.tokens,
        version: createdAccount.version,
      };

      expect(result).toEqual(expectedAccount);
    });

    it('should return null if account is not found', async () => {
      const result = await accountService.getByIdAndParentProgramSubType(
        'nonExistentId',
        'nonExistentProgramType',
      );

      expect(result).toBeNull();
    });
  });

  describe('transactionCreateOrUpdate', () => {
    it('should find and update an account with the given data', async () => {
      const mockAccount = {
        id: 'mockId',
        parentProgram: 'mockParentProgram',
        parentProgramSubType: 'mockParentProgramSubType',
        tokens: 100,
        version: 1,
      };

      await accountModel.create(mockAccount);

      const mockData = {
        id: 'mockId',
        parentProgram: 'mockParentProgram',
        parentProgramSubType: 'mockParentProgramSubType',
        tokens: 200,
        version: 2,
      };

      await accountService.transactionCreateOrUpdate(mockData);

      const updatedAccount = await accountModel
        .findOne({
          id: 'mockId',
          parentProgramSubType: 'mockParentProgramSubType',
        })
        .lean();

      expect(updatedAccount).toBeDefined();
      expect(updatedAccount.tokens).toBe(mockData.tokens);
      expect(updatedAccount.version).toBe(mockData.version);

      const expectedAccount = {
        __v: updatedAccount.__v,
        _id: updatedAccount._id,
        id: mockData.id,
        parentProgram: mockData.parentProgram,
        parentProgramSubType: mockData.parentProgramSubType,
        tokens: mockData.tokens,
        version: mockData.version,
      };

      expect(updatedAccount).toEqual(expectedAccount);
    });
  });

  describe('getHighestTokenAccountByParentProgramSubtype', () => {
    it('should find an account with the highest tokens for the given parentProgramSubType', async () => {
      const mockAccount1 = {
        id: 'mockId1',
        parentProgram: 'mockParentProgram',
        parentProgramSubType: 'mockParentProgramSubType',
        tokens: 100,
        version: 1,
      };
      const mockAccount2 = {
        id: 'mockId2',
        parentProgram: 'mockParentProgram',
        parentProgramSubType: 'mockParentProgramSubType',
        tokens: 200,
        version: 1,
      };

      await accountModel.create(mockAccount2);
      await accountModel.create(mockAccount1);

      const result =
        await accountService.getHighestTokenAccountByParentProgramSubtype(
          'mockParentProgramSubType',
        );

      const expectedAccount = {
        __v: result.__v,
        _id: result._id,
        id: mockAccount2.id,
        parentProgram: mockAccount2.parentProgram,
        parentProgramSubType: mockAccount2.parentProgramSubType,
        tokens: mockAccount2.tokens,
        version: mockAccount2.version,
      };

      expect(result).toEqual(expectedAccount);
    });

    it('should return null if no account is found for the given parentProgramSubType', async () => {
      const result =
        await accountService.getHighestTokenAccountByParentProgramSubtype(
          'nonExistentProgramType',
        );

      expect(result).toBeNull();
    });
  });
});
