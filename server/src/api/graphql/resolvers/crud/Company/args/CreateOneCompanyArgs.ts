import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { CompanyCreateInput } from '../../../inputs/CompanyCreateInput';

@TypeGraphQL.ArgsType()
export class CreateOneCompanyArgs {
  @TypeGraphQL.Field((_type) => CompanyCreateInput, {
    nullable: false,
  })
  data!: CompanyCreateInput;
}
