import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserCreateWithoutRefreshTokensInput } from './user-create-without-refresh-tokens.input';
import { Type } from 'class-transformer';
import { UserCreateOrConnectWithoutRefreshTokensInput } from './user-create-or-connect-without-refresh-tokens.input';
import { UserWhereUniqueInput } from './user-where-unique.input';

@InputType()
export class UserCreateNestedOneWithoutRefreshTokensInput {
  @Field(() => UserCreateWithoutRefreshTokensInput, { nullable: true })
  @Type(() => UserCreateWithoutRefreshTokensInput)
  create?: UserCreateWithoutRefreshTokensInput;

  @Field(() => UserCreateOrConnectWithoutRefreshTokensInput, { nullable: true })
  @Type(() => UserCreateOrConnectWithoutRefreshTokensInput)
  connectOrCreate?: UserCreateOrConnectWithoutRefreshTokensInput;

  @Field(() => UserWhereUniqueInput, { nullable: true })
  @Type(() => UserWhereUniqueInput)
  connect?: UserWhereUniqueInput;
}
