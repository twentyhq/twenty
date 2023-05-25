import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { RefreshTokenCountAggregate } from "../outputs/RefreshTokenCountAggregate";
import { RefreshTokenMaxAggregate } from "../outputs/RefreshTokenMaxAggregate";
import { RefreshTokenMinAggregate } from "../outputs/RefreshTokenMinAggregate";

@TypeGraphQL.ObjectType("RefreshTokenGroupBy", {
  isAbstract: true
})
export class RefreshTokenGroupBy {
  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  id!: string;

  @TypeGraphQL.Field(_type => Date, {
    nullable: false
  })
  createdAt!: Date;

  @TypeGraphQL.Field(_type => Date, {
    nullable: false
  })
  updatedAt!: Date;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  deletedAt!: Date | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  refreshToken!: string;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  userId!: string;

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
