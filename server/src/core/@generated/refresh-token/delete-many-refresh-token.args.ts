import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { RefreshTokenWhereInput } from './refresh-token-where.input';
import { Type } from 'class-transformer';

@ArgsType()
export class DeleteManyRefreshTokenArgs {
  @Field(() => RefreshTokenWhereInput, { nullable: true })
  @Type(() => RefreshTokenWhereInput)
  where?: RefreshTokenWhereInput;
}
