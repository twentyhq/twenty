import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { CompanyUpdateWithoutAccountOwnerInput } from './CompanyUpdateWithoutAccountOwnerInput';
import { CompanyWhereUniqueInput } from './CompanyWhereUniqueInput';

@TypeGraphQL.InputType('CompanyUpdateWithWhereUniqueWithoutAccountOwnerInput', {
  isAbstract: true,
})
export class CompanyUpdateWithWhereUniqueWithoutAccountOwnerInput {
  @TypeGraphQL.Field((_type) => CompanyWhereUniqueInput, {
    nullable: false,
  })
  where!: CompanyWhereUniqueInput;

  @TypeGraphQL.Field((_type) => CompanyUpdateWithoutAccountOwnerInput, {
    nullable: false,
  })
  data!: CompanyUpdateWithoutAccountOwnerInput;
}
