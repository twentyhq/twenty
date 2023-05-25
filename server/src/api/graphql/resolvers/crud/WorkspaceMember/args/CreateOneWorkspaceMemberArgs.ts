import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { WorkspaceMemberCreateInput } from "../../../inputs/WorkspaceMemberCreateInput";

@TypeGraphQL.ArgsType()
export class CreateOneWorkspaceMemberArgs {
  @TypeGraphQL.Field(_type => WorkspaceMemberCreateInput, {
    nullable: false
  })
  data!: WorkspaceMemberCreateInput;
}
