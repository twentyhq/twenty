import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { WorkspaceWhereInput } from "../inputs/WorkspaceWhereInput";

@TypeGraphQL.InputType("WorkspaceRelationFilter", {
  isAbstract: true
})
export class WorkspaceRelationFilter {
  @TypeGraphQL.Field(_type => WorkspaceWhereInput, {
    nullable: true
  })
  is?: WorkspaceWhereInput | undefined;

  @TypeGraphQL.Field(_type => WorkspaceWhereInput, {
    nullable: true
  })
  isNot?: WorkspaceWhereInput | undefined;
}
