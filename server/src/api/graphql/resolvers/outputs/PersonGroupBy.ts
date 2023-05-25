import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PersonCountAggregate } from "../outputs/PersonCountAggregate";
import { PersonMaxAggregate } from "../outputs/PersonMaxAggregate";
import { PersonMinAggregate } from "../outputs/PersonMinAggregate";

@TypeGraphQL.ObjectType("PersonGroupBy", {
  isAbstract: true
})
export class PersonGroupBy {
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
  firstname!: string;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  lastname!: string;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  email!: string;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  phone!: string;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  city!: string;

  @TypeGraphQL.Field(_type => String, {
    nullable: true
  })
  companyId!: string | null;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  workspaceId!: string;

  @TypeGraphQL.Field(_type => PersonCountAggregate, {
    nullable: true
  })
  _count!: PersonCountAggregate | null;

  @TypeGraphQL.Field(_type => PersonMinAggregate, {
    nullable: true
  })
  _min!: PersonMinAggregate | null;

  @TypeGraphQL.Field(_type => PersonMaxAggregate, {
    nullable: true
  })
  _max!: PersonMaxAggregate | null;
}
