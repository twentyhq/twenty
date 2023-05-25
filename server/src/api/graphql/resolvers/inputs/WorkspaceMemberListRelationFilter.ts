import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { WorkspaceMemberWhereInput } from "../inputs/WorkspaceMemberWhereInput";

@TypeGraphQL.InputType("WorkspaceMemberListRelationFilter", {
  isAbstract: true
})
export class WorkspaceMemberListRelationFilter {
  @TypeGraphQL.Field(_type => WorkspaceMemberWhereInput, {
    nullable: true
  })
  every?: WorkspaceMemberWhereInput | undefined;

  @TypeGraphQL.Field(_type => WorkspaceMemberWhereInput, {
    nullable: true
  })
  some?: WorkspaceMemberWhereInput | undefined;

  @TypeGraphQL.Field(_type => WorkspaceMemberWhereInput, {
    nullable: true
  })
  none?: WorkspaceMemberWhereInput | undefined;
}
