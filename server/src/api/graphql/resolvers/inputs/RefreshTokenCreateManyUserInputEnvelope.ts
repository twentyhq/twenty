import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { RefreshTokenCreateManyUserInput } from "../inputs/RefreshTokenCreateManyUserInput";

@TypeGraphQL.InputType("RefreshTokenCreateManyUserInputEnvelope", {
  isAbstract: true
})
export class RefreshTokenCreateManyUserInputEnvelope {
  @TypeGraphQL.Field(_type => [RefreshTokenCreateManyUserInput], {
    nullable: false
  })
  data!: RefreshTokenCreateManyUserInput[];

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  skipDuplicates?: boolean | undefined;
}
