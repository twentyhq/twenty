import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { RefreshTokenCountAggregate } from "../outputs/RefreshTokenCountAggregate";
import { RefreshTokenMaxAggregate } from "../outputs/RefreshTokenMaxAggregate";
import { RefreshTokenMinAggregate } from "../outputs/RefreshTokenMinAggregate";

@TypeGraphQL.ObjectType("AggregateRefreshToken", {
  isAbstract: true
})
export class AggregateRefreshToken {
  @TypeGraphQL.Field(_type => RefreshTokenCountAggregate, {
    nullable: true
  })
  _count!: RefreshTokenCountAggregate | null;

  @TypeGraphQL.Field(_type => RefreshTokenMinAggregate, {
    nullable: true
  })
  _min!: RefreshTokenMinAggregate | null;

  @TypeGraphQL.Field(_type => RefreshTokenMaxAggregate, {
    nullable: true
  })
  _max!: RefreshTokenMaxAggregate | null;
}
