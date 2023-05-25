import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { WorkspaceMemberCountAggregate } from "../outputs/WorkspaceMemberCountAggregate";
import { WorkspaceMemberMaxAggregate } from "../outputs/WorkspaceMemberMaxAggregate";
import { WorkspaceMemberMinAggregate } from "../outputs/WorkspaceMemberMinAggregate";

@TypeGraphQL.ObjectType("AggregateWorkspaceMember", {
  isAbstract: true
})
export class AggregateWorkspaceMember {
  @TypeGraphQL.Field(_type => WorkspaceMemberCountAggregate, {
    nullable: true
  })
  _count!: WorkspaceMemberCountAggregate | null;

  @TypeGraphQL.Field(_type => WorkspaceMemberMinAggregate, {
    nullable: true
  })
  _min!: WorkspaceMemberMinAggregate | null;

  @TypeGraphQL.Field(_type => WorkspaceMemberMaxAggregate, {
    nullable: true
  })
  _max!: WorkspaceMemberMaxAggregate | null;
}
