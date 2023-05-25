import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { WorkspaceMemberWhereInput } from "../../../inputs/WorkspaceMemberWhereInput";

@TypeGraphQL.ArgsType()
export class DeleteManyWorkspaceMemberArgs {
  @TypeGraphQL.Field(_type => WorkspaceMemberWhereInput, {
    nullable: true
  })
  where?: WorkspaceMemberWhereInput | undefined;
}
