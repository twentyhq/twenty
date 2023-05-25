import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { WorkspaceMemberOrderByWithRelationInput } from "../../../inputs/WorkspaceMemberOrderByWithRelationInput";
import { WorkspaceMemberWhereInput } from "../../../inputs/WorkspaceMemberWhereInput";
import { WorkspaceMemberWhereUniqueInput } from "../../../inputs/WorkspaceMemberWhereUniqueInput";
import { WorkspaceMemberScalarFieldEnum } from "../../../../enums/WorkspaceMemberScalarFieldEnum";

@TypeGraphQL.ArgsType()
export class FindFirstWorkspaceMemberArgs {
  @TypeGraphQL.Field(_type => WorkspaceMemberWhereInput, {
    nullable: true
  })
  where?: WorkspaceMemberWhereInput | undefined;

  @TypeGraphQL.Field(_type => [WorkspaceMemberOrderByWithRelationInput], {
    nullable: true
  })
  orderBy?: WorkspaceMemberOrderByWithRelationInput[] | undefined;

  @TypeGraphQL.Field(_type => WorkspaceMemberWhereUniqueInput, {
    nullable: true
  })
  cursor?: WorkspaceMemberWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;

  @TypeGraphQL.Field(_type => [WorkspaceMemberScalarFieldEnum], {
    nullable: true
  })
  distinct?: Array<"id" | "createdAt" | "updatedAt" | "deletedAt" | "userId" | "workspaceId"> | undefined;
}
