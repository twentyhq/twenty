import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { WorkspaceUpdateManyMutationInput } from "../../../inputs/WorkspaceUpdateManyMutationInput";
import { WorkspaceWhereInput } from "../../../inputs/WorkspaceWhereInput";

@TypeGraphQL.ArgsType()
export class UpdateManyWorkspaceArgs {
  @TypeGraphQL.Field(_type => WorkspaceUpdateManyMutationInput, {
    nullable: false
  })
  data!: WorkspaceUpdateManyMutationInput;

  @TypeGraphQL.Field(_type => WorkspaceWhereInput, {
    nullable: true
  })
  where?: WorkspaceWhereInput | undefined;
}
