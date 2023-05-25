import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { UserCreateWithoutCompaniesInput } from './UserCreateWithoutCompaniesInput';
import { UserUpdateWithoutCompaniesInput } from './UserUpdateWithoutCompaniesInput';

@TypeGraphQL.InputType('UserUpsertWithoutCompaniesInput', {
  isAbstract: true,
})
export class UserUpsertWithoutCompaniesInput {
  @TypeGraphQL.Field((_type) => UserUpdateWithoutCompaniesInput, {
    nullable: false,
  })
  update!: UserUpdateWithoutCompaniesInput;

  @TypeGraphQL.Field((_type) => UserCreateWithoutCompaniesInput, {
    nullable: false,
  })
  create!: UserCreateWithoutCompaniesInput;
}
