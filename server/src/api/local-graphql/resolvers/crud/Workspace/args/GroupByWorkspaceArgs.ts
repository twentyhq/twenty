import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { WorkspaceOrderByWithAggregationInput } from '../../../inputs/WorkspaceOrderByWithAggregationInput';
import { WorkspaceScalarWhereWithAggregatesInput } from '../../../inputs/WorkspaceScalarWhereWithAggregatesInput';
import { WorkspaceWhereInput } from '../../../inputs/WorkspaceWhereInput';
import { WorkspaceScalarFieldEnum } from '../../../../enums/WorkspaceScalarFieldEnum';

@TypeGraphQL.ArgsType()
export class GroupByWorkspaceArgs {
  @TypeGraphQL.Field((_type) => WorkspaceWhereInput, {
    nullable: true,
  })
  where?: WorkspaceWhereInput | undefined;

  @TypeGraphQL.Field((_type) => [WorkspaceOrderByWithAggregationInput], {
    nullable: true,
  })
  orderBy?: WorkspaceOrderByWithAggregationInput[] | undefined;

  @TypeGraphQL.Field((_type) => [WorkspaceScalarFieldEnum], {
    nullable: false,
  })
  by!: Array<
    | 'id'
    | 'createdAt'
    | 'updatedAt'
    | 'deletedAt'
    | 'domainName'
    | 'displayName'
  >;

  @TypeGraphQL.Field((_type) => WorkspaceScalarWhereWithAggregatesInput, {
    nullable: true,
  })
  having?: WorkspaceScalarWhereWithAggregatesInput | undefined;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  take?: number | undefined;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  skip?: number | undefined;
}
