import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { WorkspaceCreateManyInput } from "../../../inputs/WorkspaceCreateManyInput";

@TypeGraphQL.ArgsType()
export class CreateManyWorkspaceArgs {
  @TypeGraphQL.Field(_type => [WorkspaceCreateManyInput], {
    nullable: false
  })
  data!: WorkspaceCreateManyInput[];

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  skipDuplicates?: boolean | undefined;
}
