import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { UserCreateOrConnectWithoutRefreshTokensInput } from './UserCreateOrConnectWithoutRefreshTokensInput';
import { UserCreateWithoutRefreshTokensInput } from './UserCreateWithoutRefreshTokensInput';
import { UserWhereUniqueInput } from './UserWhereUniqueInput';

@TypeGraphQL.InputType('UserCreateNestedOneWithoutRefreshTokensInput', {
  isAbstract: true,
})
export class UserCreateNestedOneWithoutRefreshTokensInput {
  @TypeGraphQL.Field((_type) => UserCreateWithoutRefreshTokensInput, {
    nullable: true,
  })
  create?: UserCreateWithoutRefreshTokensInput | undefined;

  @TypeGraphQL.Field((_type) => UserCreateOrConnectWithoutRefreshTokensInput, {
    nullable: true,
  })
  connectOrCreate?: UserCreateOrConnectWithoutRefreshTokensInput | undefined;

  @TypeGraphQL.Field((_type) => UserWhereUniqueInput, {
    nullable: true,
  })
  connect?: UserWhereUniqueInput | undefined;
}
