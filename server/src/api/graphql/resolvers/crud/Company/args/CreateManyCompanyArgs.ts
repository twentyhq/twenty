import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { CompanyCreateManyInput } from '../../../inputs/CompanyCreateManyInput';

@TypeGraphQL.ArgsType()
export class CreateManyCompanyArgs {
  @TypeGraphQL.Field((_type) => [CompanyCreateManyInput], {
    nullable: false,
  })
  data!: CompanyCreateManyInput[];

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  skipDuplicates?: boolean | undefined;
}
