import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { CompanyScalarWhereInput } from './CompanyScalarWhereInput';
import { CompanyUpdateManyMutationInput } from './CompanyUpdateManyMutationInput';

@TypeGraphQL.InputType('CompanyUpdateManyWithWhereWithoutAccountOwnerInput', {
  isAbstract: true,
})
export class CompanyUpdateManyWithWhereWithoutAccountOwnerInput {
  @TypeGraphQL.Field((_type) => CompanyScalarWhereInput, {
    nullable: false,
  })
  where!: CompanyScalarWhereInput;

  @TypeGraphQL.Field((_type) => CompanyUpdateManyMutationInput, {
    nullable: false,
  })
  data!: CompanyUpdateManyMutationInput;
}
