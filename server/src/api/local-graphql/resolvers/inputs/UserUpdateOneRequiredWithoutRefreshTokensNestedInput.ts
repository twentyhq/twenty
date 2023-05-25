import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { UserCreateOrConnectWithoutRefreshTokensInput } from './UserCreateOrConnectWithoutRefreshTokensInput';
import { UserCreateWithoutRefreshTokensInput } from './UserCreateWithoutRefreshTokensInput';
import { UserUpdateWithoutRefreshTokensInput } from './UserUpdateWithoutRefreshTokensInput';
import { UserUpsertWithoutRefreshTokensInput } from './UserUpsertWithoutRefreshTokensInput';
import { UserWhereUniqueInput } from './UserWhereUniqueInput';

@TypeGraphQL.InputType('UserUpdateOneRequiredWithoutRefreshTokensNestedInput', {
  isAbstract: true,
})
export class UserUpdateOneRequiredWithoutRefreshTokensNestedInput {
  @TypeGraphQL.Field((_type) => UserCreateWithoutRefreshTokensInput, {
    nullable: true,
  })
  create?: UserCreateWithoutRefreshTokensInput | undefined;

  @TypeGraphQL.Field((_type) => UserCreateOrConnectWithoutRefreshTokensInput, {
    nullable: true,
  })
  connectOrCreate?: UserCreateOrConnectWithoutRefreshTokensInput | undefined;

  @TypeGraphQL.Field((_type) => UserUpsertWithoutRefreshTokensInput, {
    nullable: true,
  })
  upsert?: UserUpsertWithoutRefreshTokensInput | undefined;

  @TypeGraphQL.Field((_type) => UserWhereUniqueInput, {
    nullable: true,
  })
  connect?: UserWhereUniqueInput | undefined;

  @TypeGraphQL.Field((_type) => UserUpdateWithoutRefreshTokensInput, {
    nullable: true,
  })
  update?: UserUpdateWithoutRefreshTokensInput | undefined;
}
