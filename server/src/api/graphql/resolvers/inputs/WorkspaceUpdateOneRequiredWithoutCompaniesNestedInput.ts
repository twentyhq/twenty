import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { WorkspaceCreateOrConnectWithoutCompaniesInput } from "../inputs/WorkspaceCreateOrConnectWithoutCompaniesInput";
import { WorkspaceCreateWithoutCompaniesInput } from "../inputs/WorkspaceCreateWithoutCompaniesInput";
import { WorkspaceUpdateWithoutCompaniesInput } from "../inputs/WorkspaceUpdateWithoutCompaniesInput";
import { WorkspaceUpsertWithoutCompaniesInput } from "../inputs/WorkspaceUpsertWithoutCompaniesInput";
import { WorkspaceWhereUniqueInput } from "../inputs/WorkspaceWhereUniqueInput";

@TypeGraphQL.InputType("WorkspaceUpdateOneRequiredWithoutCompaniesNestedInput", {
  isAbstract: true
})
export class WorkspaceUpdateOneRequiredWithoutCompaniesNestedInput {
  @TypeGraphQL.Field(_type => WorkspaceCreateWithoutCompaniesInput, {
    nullable: true
  })
  create?: WorkspaceCreateWithoutCompaniesInput | undefined;

  @TypeGraphQL.Field(_type => WorkspaceCreateOrConnectWithoutCompaniesInput, {
    nullable: true
  })
  connectOrCreate?: WorkspaceCreateOrConnectWithoutCompaniesInput | undefined;

  @TypeGraphQL.Field(_type => WorkspaceUpsertWithoutCompaniesInput, {
    nullable: true
  })
  upsert?: WorkspaceUpsertWithoutCompaniesInput | undefined;

  @TypeGraphQL.Field(_type => WorkspaceWhereUniqueInput, {
    nullable: true
  })
  connect?: WorkspaceWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => WorkspaceUpdateWithoutCompaniesInput, {
    nullable: true
  })
  update?: WorkspaceUpdateWithoutCompaniesInput | undefined;
}
