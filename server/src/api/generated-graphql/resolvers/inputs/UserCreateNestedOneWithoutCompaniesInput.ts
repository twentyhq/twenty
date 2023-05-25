import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { UserCreateOrConnectWithoutCompaniesInput } from './UserCreateOrConnectWithoutCompaniesInput';
import { UserCreateWithoutCompaniesInput } from './UserCreateWithoutCompaniesInput';
import { UserWhereUniqueInput } from './UserWhereUniqueInput';

@TypeGraphQL.InputType('UserCreateNestedOneWithoutCompaniesInput', {
  isAbstract: true,
})
export class UserCreateNestedOneWithoutCompaniesInput {
  @TypeGraphQL.Field((_type) => UserCreateWithoutCompaniesInput, {
    nullable: true,
  })
  create?: UserCreateWithoutCompaniesInput | undefined;

  @TypeGraphQL.Field((_type) => UserCreateOrConnectWithoutCompaniesInput, {
    nullable: true,
  })
  connectOrCreate?: UserCreateOrConnectWithoutCompaniesInput | undefined;

  @TypeGraphQL.Field((_type) => UserWhereUniqueInput, {
    nullable: true,
  })
  connect?: UserWhereUniqueInput | undefined;
}
