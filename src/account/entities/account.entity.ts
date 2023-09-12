import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

@Schema({ collection: 'accounts', autoCreate: true, autoIndex: true })
export class Account extends Document {
  @Prop({ index: true, required: true })
  id: string;

  @Prop({ index: true, required: true })
  parentProgram: string;

  @Prop({ index: true, required: true })
  parentProgramSubType: string;

  @Prop({ required: true })
  tokens: number;

  @Prop({ required: true, default: 1 })
  version: number;
}

export const AccountSchema = SchemaFactory.createForClass(Account);
export type AccountDocument = HydratedDocument<Account>;
