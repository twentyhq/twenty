import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { WorkspaceMemberWhereUniqueInput } from "../../../inputs/WorkspaceMemberWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class DeleteOneWorkspaceMemberArgs {
  @TypeGraphQL.Field(_type => WorkspaceMemberWhereUniqueInput, {
    nullable: false
  })
  where!: WorkspaceMemberWhereUniqueInput;
}
