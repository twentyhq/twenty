import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { WorkspaceCreateInput } from "../../../inputs/WorkspaceCreateInput";

@TypeGraphQL.ArgsType()
export class CreateOneWorkspaceArgs {
  @TypeGraphQL.Field(_type => WorkspaceCreateInput, {
    nullable: false
  })
  data!: WorkspaceCreateInput;
}
