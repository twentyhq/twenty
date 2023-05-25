import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { UserCreateWithoutRefreshTokensInput } from './UserCreateWithoutRefreshTokensInput';
import { UserUpdateWithoutRefreshTokensInput } from './UserUpdateWithoutRefreshTokensInput';

@TypeGraphQL.InputType('UserUpsertWithoutRefreshTokensInput', {
  isAbstract: true,
})
export class UserUpsertWithoutRefreshTokensInput {
  @TypeGraphQL.Field((_type) => UserUpdateWithoutRefreshTokensInput, {
    nullable: false,
  })
  update!: UserUpdateWithoutRefreshTokensInput;

  @TypeGraphQL.Field((_type) => UserCreateWithoutRefreshTokensInput, {
    nullable: false,
  })
  create!: UserCreateWithoutRefreshTokensInput;
}
