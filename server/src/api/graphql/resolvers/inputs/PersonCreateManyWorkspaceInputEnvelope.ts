import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { PersonCreateManyWorkspaceInput } from "../inputs/PersonCreateManyWorkspaceInput";

@TypeGraphQL.InputType("PersonCreateManyWorkspaceInputEnvelope", {
  isAbstract: true
})
export class PersonCreateManyWorkspaceInputEnvelope {
  @TypeGraphQL.Field(_type => [PersonCreateManyWorkspaceInput], {
    nullable: false
  })
  data!: PersonCreateManyWorkspaceInput[];

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  skipDuplicates?: boolean | undefined;
}
