import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { CompanyCreateWithoutPeopleInput } from '../inputs/CompanyCreateWithoutPeopleInput';
import { CompanyWhereUniqueInput } from '../inputs/CompanyWhereUniqueInput';

@TypeGraphQL.InputType('CompanyCreateOrConnectWithoutPeopleInput', {
  isAbstract: true,
})
export class CompanyCreateOrConnectWithoutPeopleInput {
  @TypeGraphQL.Field((_type) => CompanyWhereUniqueInput, {
    nullable: false,
  })
  where!: CompanyWhereUniqueInput;

  @TypeGraphQL.Field((_type) => CompanyCreateWithoutPeopleInput, {
    nullable: false,
  })
  create!: CompanyCreateWithoutPeopleInput;
}
