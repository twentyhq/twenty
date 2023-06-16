import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { RefreshTokenCreateInput } from './refresh-token-create.input';
import { Type } from 'class-transformer';

@ArgsType()
export class CreateOneRefreshTokenArgs {
  @Field(() => RefreshTokenCreateInput, { nullable: false })
  @Type(() => RefreshTokenCreateInput)
  data!: RefreshTokenCreateInput;
}
