import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { WorkspaceMemberOrderByWithAggregationInput } from "../../../inputs/WorkspaceMemberOrderByWithAggregationInput";
import { WorkspaceMemberScalarWhereWithAggregatesInput } from "../../../inputs/WorkspaceMemberScalarWhereWithAggregatesInput";
import { WorkspaceMemberWhereInput } from "../../../inputs/WorkspaceMemberWhereInput";
import { WorkspaceMemberScalarFieldEnum } from "../../../../enums/WorkspaceMemberScalarFieldEnum";

@TypeGraphQL.ArgsType()
export class GroupByWorkspaceMemberArgs {
  @TypeGraphQL.Field(_type => WorkspaceMemberWhereInput, {
    nullable: true
  })
  where?: WorkspaceMemberWhereInput | undefined;

  @TypeGraphQL.Field(_type => [WorkspaceMemberOrderByWithAggregationInput], {
    nullable: true
  })
  orderBy?: WorkspaceMemberOrderByWithAggregationInput[] | undefined;

  @TypeGraphQL.Field(_type => [WorkspaceMemberScalarFieldEnum], {
    nullable: false
  })
  by!: Array<"id" | "createdAt" | "updatedAt" | "deletedAt" | "userId" | "workspaceId">;

  @TypeGraphQL.Field(_type => WorkspaceMemberScalarWhereWithAggregatesInput, {
    nullable: true
  })
  having?: WorkspaceMemberScalarWhereWithAggregatesInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;
}
