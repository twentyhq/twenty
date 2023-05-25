import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { CompanyCreateWithoutAccountOwnerInput } from '../inputs/CompanyCreateWithoutAccountOwnerInput';
import { CompanyWhereUniqueInput } from '../inputs/CompanyWhereUniqueInput';

@TypeGraphQL.InputType('CompanyCreateOrConnectWithoutAccountOwnerInput', {
  isAbstract: true,
})
export class CompanyCreateOrConnectWithoutAccountOwnerInput {
  @TypeGraphQL.Field((_type) => CompanyWhereUniqueInput, {
    nullable: false,
  })
  where!: CompanyWhereUniqueInput;

  @TypeGraphQL.Field((_type) => CompanyCreateWithoutAccountOwnerInput, {
    nullable: false,
  })
  create!: CompanyCreateWithoutAccountOwnerInput;
}
