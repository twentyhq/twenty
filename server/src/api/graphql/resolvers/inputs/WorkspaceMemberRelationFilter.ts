import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { WorkspaceMemberWhereInput } from "../inputs/WorkspaceMemberWhereInput";

@TypeGraphQL.InputType("WorkspaceMemberRelationFilter", {
  isAbstract: true
})
export class WorkspaceMemberRelationFilter {
  @TypeGraphQL.Field(_type => WorkspaceMemberWhereInput, {
    nullable: true
  })
  is?: WorkspaceMemberWhereInput | undefined;

  @TypeGraphQL.Field(_type => WorkspaceMemberWhereInput, {
    nullable: true
  })
  isNot?: WorkspaceMemberWhereInput | undefined;
}
