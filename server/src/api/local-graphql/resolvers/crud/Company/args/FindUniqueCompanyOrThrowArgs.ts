import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { CompanyWhereUniqueInput } from '../../../inputs/CompanyWhereUniqueInput';

@TypeGraphQL.ArgsType()
export class FindUniqueCompanyOrThrowArgs {
  @TypeGraphQL.Field((_type) => CompanyWhereUniqueInput, {
    nullable: false,
  })
  where!: CompanyWhereUniqueInput;
}
