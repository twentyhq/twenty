import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { WorkspaceMemberUpdateInput } from "../../../inputs/WorkspaceMemberUpdateInput";
import { WorkspaceMemberWhereUniqueInput } from "../../../inputs/WorkspaceMemberWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class UpdateOneWorkspaceMemberArgs {
  @TypeGraphQL.Field(_type => WorkspaceMemberUpdateInput, {
    nullable: false
  })
  data!: WorkspaceMemberUpdateInput;

  @TypeGraphQL.Field(_type => WorkspaceMemberWhereUniqueInput, {
    nullable: false
  })
  where!: WorkspaceMemberWhereUniqueInput;
}
