import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { CompanyCreateInput } from '../../../inputs/CompanyCreateInput';
import { CompanyUpdateInput } from '../../../inputs/CompanyUpdateInput';
import { CompanyWhereUniqueInput } from '../../../inputs/CompanyWhereUniqueInput';

@TypeGraphQL.ArgsType()
export class UpsertOneCompanyArgs {
  @TypeGraphQL.Field((_type) => CompanyWhereUniqueInput, {
    nullable: false,
  })
  where!: CompanyWhereUniqueInput;

  @TypeGraphQL.Field((_type) => CompanyCreateInput, {
    nullable: false,
  })
  create!: CompanyCreateInput;

  @TypeGraphQL.Field((_type) => CompanyUpdateInput, {
    nullable: false,
  })
  update!: CompanyUpdateInput;
}
