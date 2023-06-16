import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserUpdateWithoutRefreshTokensInput } from './user-update-without-refresh-tokens.input';
import { Type } from 'class-transformer';
import { UserCreateWithoutRefreshTokensInput } from './user-create-without-refresh-tokens.input';

@InputType()
export class UserUpsertWithoutRefreshTokensInput {
  @Field(() => UserUpdateWithoutRefreshTokensInput, { nullable: false })
  @Type(() => UserUpdateWithoutRefreshTokensInput)
  update!: UserUpdateWithoutRefreshTokensInput;

  @Field(() => UserCreateWithoutRefreshTokensInput, { nullable: false })
  @Type(() => UserCreateWithoutRefreshTokensInput)
  create!: UserCreateWithoutRefreshTokensInput;
}
