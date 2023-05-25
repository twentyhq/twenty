import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";

@TypeGraphQL.InputType("DateTimeFieldUpdateOperationsInput", {
  isAbstract: true
})
export class DateTimeFieldUpdateOperationsInput {
  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  set?: Date | undefined;
}
