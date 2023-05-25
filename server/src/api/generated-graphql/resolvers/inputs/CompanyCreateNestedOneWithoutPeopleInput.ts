import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { CompanyCreateOrConnectWithoutPeopleInput } from './CompanyCreateOrConnectWithoutPeopleInput';
import { CompanyCreateWithoutPeopleInput } from './CompanyCreateWithoutPeopleInput';
import { CompanyWhereUniqueInput } from './CompanyWhereUniqueInput';

@TypeGraphQL.InputType('CompanyCreateNestedOneWithoutPeopleInput', {
  isAbstract: true,
})
export class CompanyCreateNestedOneWithoutPeopleInput {
  @TypeGraphQL.Field((_type) => CompanyCreateWithoutPeopleInput, {
    nullable: true,
  })
  create?: CompanyCreateWithoutPeopleInput | undefined;

  @TypeGraphQL.Field((_type) => CompanyCreateOrConnectWithoutPeopleInput, {
    nullable: true,
  })
  connectOrCreate?: CompanyCreateOrConnectWithoutPeopleInput | undefined;

  @TypeGraphQL.Field((_type) => CompanyWhereUniqueInput, {
    nullable: true,
  })
  connect?: CompanyWhereUniqueInput | undefined;
}
