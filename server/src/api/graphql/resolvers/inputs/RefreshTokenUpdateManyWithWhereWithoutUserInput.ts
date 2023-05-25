import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { RefreshTokenScalarWhereInput } from "../inputs/RefreshTokenScalarWhereInput";
import { RefreshTokenUpdateManyMutationInput } from "../inputs/RefreshTokenUpdateManyMutationInput";

@TypeGraphQL.InputType("RefreshTokenUpdateManyWithWhereWithoutUserInput", {
  isAbstract: true
})
export class RefreshTokenUpdateManyWithWhereWithoutUserInput {
  @TypeGraphQL.Field(_type => RefreshTokenScalarWhereInput, {
    nullable: false
  })
  where!: RefreshTokenScalarWhereInput;

  @TypeGraphQL.Field(_type => RefreshTokenUpdateManyMutationInput, {
    nullable: false
  })
  data!: RefreshTokenUpdateManyMutationInput;
}
