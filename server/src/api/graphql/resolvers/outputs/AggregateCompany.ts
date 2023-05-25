import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { CompanyAvgAggregate } from "../outputs/CompanyAvgAggregate";
import { CompanyCountAggregate } from "../outputs/CompanyCountAggregate";
import { CompanyMaxAggregate } from "../outputs/CompanyMaxAggregate";
import { CompanyMinAggregate } from "../outputs/CompanyMinAggregate";
import { CompanySumAggregate } from "../outputs/CompanySumAggregate";

@TypeGraphQL.ObjectType("AggregateCompany", {
  isAbstract: true
})
export class AggregateCompany {
  @TypeGraphQL.Field(_type => CompanyCountAggregate, {
    nullable: true
  })
  _count!: CompanyCountAggregate | null;

  @TypeGraphQL.Field(_type => CompanyAvgAggregate, {
    nullable: true
  })
  _avg!: CompanyAvgAggregate | null;

  @TypeGraphQL.Field(_type => CompanySumAggregate, {
    nullable: true
  })
  _sum!: CompanySumAggregate | null;

  @TypeGraphQL.Field(_type => CompanyMinAggregate, {
    nullable: true
  })
  _min!: CompanyMinAggregate | null;

  @TypeGraphQL.Field(_type => CompanyMaxAggregate, {
    nullable: true
  })
  _max!: CompanyMaxAggregate | null;
}
