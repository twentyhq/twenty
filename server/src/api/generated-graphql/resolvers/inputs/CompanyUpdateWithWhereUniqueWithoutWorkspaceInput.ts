import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { CompanyUpdateWithoutWorkspaceInput } from './CompanyUpdateWithoutWorkspaceInput';
import { CompanyWhereUniqueInput } from './CompanyWhereUniqueInput';

@TypeGraphQL.InputType('CompanyUpdateWithWhereUniqueWithoutWorkspaceInput', {
  isAbstract: true,
})
export class CompanyUpdateWithWhereUniqueWithoutWorkspaceInput {
  @TypeGraphQL.Field((_type) => CompanyWhereUniqueInput, {
    nullable: false,
  })
  where!: CompanyWhereUniqueInput;

  @TypeGraphQL.Field((_type) => CompanyUpdateWithoutWorkspaceInput, {
    nullable: false,
  })
  data!: CompanyUpdateWithoutWorkspaceInput;
}
