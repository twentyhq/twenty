import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { CompanyCreateOrConnectWithoutPeopleInput } from '../inputs/CompanyCreateOrConnectWithoutPeopleInput';
import { CompanyCreateWithoutPeopleInput } from '../inputs/CompanyCreateWithoutPeopleInput';
import { CompanyUpdateWithoutPeopleInput } from '../inputs/CompanyUpdateWithoutPeopleInput';
import { CompanyUpsertWithoutPeopleInput } from '../inputs/CompanyUpsertWithoutPeopleInput';
import { CompanyWhereUniqueInput } from '../inputs/CompanyWhereUniqueInput';

@TypeGraphQL.InputType('CompanyUpdateOneWithoutPeopleNestedInput', {
  isAbstract: true,
})
export class CompanyUpdateOneWithoutPeopleNestedInput {
  @TypeGraphQL.Field((_type) => CompanyCreateWithoutPeopleInput, {
    nullable: true,
  })
  create?: CompanyCreateWithoutPeopleInput | undefined;

  @TypeGraphQL.Field((_type) => CompanyCreateOrConnectWithoutPeopleInput, {
    nullable: true,
  })
  connectOrCreate?: CompanyCreateOrConnectWithoutPeopleInput | undefined;

  @TypeGraphQL.Field((_type) => CompanyUpsertWithoutPeopleInput, {
    nullable: true,
  })
  upsert?: CompanyUpsertWithoutPeopleInput | undefined;

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  disconnect?: boolean | undefined;

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  delete?: boolean | undefined;

  @TypeGraphQL.Field((_type) => CompanyWhereUniqueInput, {
    nullable: true,
  })
  connect?: CompanyWhereUniqueInput | undefined;

  @TypeGraphQL.Field((_type) => CompanyUpdateWithoutPeopleInput, {
    nullable: true,
  })
  update?: CompanyUpdateWithoutPeopleInput | undefined;
}
