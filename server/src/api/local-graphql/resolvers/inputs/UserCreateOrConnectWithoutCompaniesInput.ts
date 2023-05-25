import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { UserCreateWithoutCompaniesInput } from './UserCreateWithoutCompaniesInput';
import { UserWhereUniqueInput } from './UserWhereUniqueInput';

@TypeGraphQL.InputType('UserCreateOrConnectWithoutCompaniesInput', {
  isAbstract: true,
})
export class UserCreateOrConnectWithoutCompaniesInput {
  @TypeGraphQL.Field((_type) => UserWhereUniqueInput, {
    nullable: false,
  })
  where!: UserWhereUniqueInput;

  @TypeGraphQL.Field((_type) => UserCreateWithoutCompaniesInput, {
    nullable: false,
  })
  create!: UserCreateWithoutCompaniesInput;
}
