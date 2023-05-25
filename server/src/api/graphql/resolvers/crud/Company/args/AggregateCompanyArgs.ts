import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { CompanyOrderByWithRelationInput } from '../../../inputs/CompanyOrderByWithRelationInput';
import { CompanyWhereInput } from '../../../inputs/CompanyWhereInput';
import { CompanyWhereUniqueInput } from '../../../inputs/CompanyWhereUniqueInput';

@TypeGraphQL.ArgsType()
export class AggregateCompanyArgs {
  @TypeGraphQL.Field((_type) => CompanyWhereInput, {
    nullable: true,
  })
  where?: CompanyWhereInput | undefined;

  @TypeGraphQL.Field((_type) => [CompanyOrderByWithRelationInput], {
    nullable: true,
  })
  orderBy?: CompanyOrderByWithRelationInput[] | undefined;

  @TypeGraphQL.Field((_type) => CompanyWhereUniqueInput, {
    nullable: true,
  })
  cursor?: CompanyWhereUniqueInput | undefined;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  take?: number | undefined;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  skip?: number | undefined;
}
