import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { NestedBoolFilter } from "../inputs/NestedBoolFilter";
import { NestedIntFilter } from "../inputs/NestedIntFilter";

@TypeGraphQL.InputType("NestedBoolWithAggregatesFilter", {
  isAbstract: true
})
export class NestedBoolWithAggregatesFilter {
  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  equals?: boolean | undefined;

  @TypeGraphQL.Field(_type => NestedBoolWithAggregatesFilter, {
    nullable: true
  })
  not?: NestedBoolWithAggregatesFilter | undefined;

  @TypeGraphQL.Field(_type => NestedIntFilter, {
    nullable: true
  })
  _count?: NestedIntFilter | undefined;

  @TypeGraphQL.Field(_type => NestedBoolFilter, {
    nullable: true
  })
  _min?: NestedBoolFilter | undefined;

  @TypeGraphQL.Field(_type => NestedBoolFilter, {
    nullable: true
  })
  _max?: NestedBoolFilter | undefined;
}
