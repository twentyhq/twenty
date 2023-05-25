import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { WorkspaceUpdateInput } from "../../../inputs/WorkspaceUpdateInput";
import { WorkspaceWhereUniqueInput } from "../../../inputs/WorkspaceWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpdateOneWorkspaceArgs {
  @TypeGraphQL.Field(_type => WorkspaceUpdateInput, {
    nullable: false
  })
  data!: WorkspaceUpdateInput;

  @TypeGraphQL.Field(_type => WorkspaceWhereUniqueInput, {
    nullable: false
  })
  where!: WorkspaceWhereUniqueInput;
}
