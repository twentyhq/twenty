import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { WorkspaceCreateWithoutCompaniesInput } from "../inputs/WorkspaceCreateWithoutCompaniesInput";
import { WorkspaceUpdateWithoutCompaniesInput } from "../inputs/WorkspaceUpdateWithoutCompaniesInput";

@TypeGraphQL.InputType("WorkspaceUpsertWithoutCompaniesInput", {
  isAbstract: true
})
export class WorkspaceUpsertWithoutCompaniesInput {
  @TypeGraphQL.Field(_type => WorkspaceUpdateWithoutCompaniesInput, {
    nullable: false
  })
  update!: WorkspaceUpdateWithoutCompaniesInput;

  @TypeGraphQL.Field(_type => WorkspaceCreateWithoutCompaniesInput, {
    nullable: false
  })
  create!: WorkspaceCreateWithoutCompaniesInput;
}
