import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { RefreshTokenWhereUniqueInput } from './refresh-token-where-unique.input';
import { Type } from 'class-transformer';
import { RefreshTokenCreateInput } from './refresh-token-create.input';
import { RefreshTokenUpdateInput } from './refresh-token-update.input';

@ArgsType()
export class UpsertOneRefreshTokenArgs {
  @Field(() => RefreshTokenWhereUniqueInput, { nullable: false })
  @Type(() => RefreshTokenWhereUniqueInput)
  where!: RefreshTokenWhereUniqueInput;

  @Field(() => RefreshTokenCreateInput, { nullable: false })
  @Type(() => RefreshTokenCreateInput)
  create!: RefreshTokenCreateInput;

  @Field(() => RefreshTokenUpdateInput, { nullable: false })
  @Type(() => RefreshTokenUpdateInput)
  update!: RefreshTokenUpdateInput;
}
