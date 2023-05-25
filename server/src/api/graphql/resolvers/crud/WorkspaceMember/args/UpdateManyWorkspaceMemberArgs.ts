import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { WorkspaceMemberUpdateManyMutationInput } from "../../../inputs/WorkspaceMemberUpdateManyMutationInput";
import { WorkspaceMemberWhereInput } from "../../../inputs/WorkspaceMemberWhereInput";

@TypeGraphQL.ArgsType()
export class UpdateManyWorkspaceMemberArgs {
  @TypeGraphQL.Field(_type => WorkspaceMemberUpdateManyMutationInput, {
    nullable: false
  })
  data!: WorkspaceMemberUpdateManyMutationInput;

  @TypeGraphQL.Field(_type => WorkspaceMemberWhereInput, {
    nullable: true
  })
  where?: WorkspaceMemberWhereInput | undefined;
}
