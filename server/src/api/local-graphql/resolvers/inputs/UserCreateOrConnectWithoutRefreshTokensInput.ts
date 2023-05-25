import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { UserCreateWithoutRefreshTokensInput } from './UserCreateWithoutRefreshTokensInput';
import { UserWhereUniqueInput } from './UserWhereUniqueInput';

@TypeGraphQL.InputType('UserCreateOrConnectWithoutRefreshTokensInput', {
  isAbstract: true,
})
export class UserCreateOrConnectWithoutRefreshTokensInput {
  @TypeGraphQL.Field((_type) => UserWhereUniqueInput, {
    nullable: false,
  })
  where!: UserWhereUniqueInput;

  @TypeGraphQL.Field((_type) => UserCreateWithoutRefreshTokensInput, {
    nullable: false,
  })
  create!: UserCreateWithoutRefreshTokensInput;
}
