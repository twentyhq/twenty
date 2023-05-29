import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserCreateWithoutRefreshTokensInput } from './user-create-without-refresh-tokens.input';
import { Type } from 'class-transformer';
import { UserCreateOrConnectWithoutRefreshTokensInput } from './user-create-or-connect-without-refresh-tokens.input';
import { UserUpsertWithoutRefreshTokensInput } from './user-upsert-without-refresh-tokens.input';
import { UserWhereUniqueInput } from './user-where-unique.input';
import { UserUpdateWithoutRefreshTokensInput } from './user-update-without-refresh-tokens.input';

@InputType()
export class UserUpdateOneRequiredWithoutRefreshTokensNestedInput {
  @Field(() => UserCreateWithoutRefreshTokensInput, { nullable: true })
  @Type(() => UserCreateWithoutRefreshTokensInput)
  create?: UserCreateWithoutRefreshTokensInput;

  @Field(() => UserCreateOrConnectWithoutRefreshTokensInput, { nullable: true })
  @Type(() => UserCreateOrConnectWithoutRefreshTokensInput)
  connectOrCreate?: UserCreateOrConnectWithoutRefreshTokensInput;

  @Field(() => UserUpsertWithoutRefreshTokensInput, { nullable: true })
  @Type(() => UserUpsertWithoutRefreshTokensInput)
  upsert?: UserUpsertWithoutRefreshTokensInput;

  @Field(() => UserWhereUniqueInput, { nullable: true })
  @Type(() => UserWhereUniqueInput)
  connect?: UserWhereUniqueInput;

  @Field(() => UserUpdateWithoutRefreshTokensInput, { nullable: true })
  @Type(() => UserUpdateWithoutRefreshTokensInput)
  update?: UserUpdateWithoutRefreshTokensInput;
}
