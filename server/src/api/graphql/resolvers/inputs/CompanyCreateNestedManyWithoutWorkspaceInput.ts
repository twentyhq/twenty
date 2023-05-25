import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { CompanyCreateManyWorkspaceInputEnvelope } from "../inputs/CompanyCreateManyWorkspaceInputEnvelope";
import { CompanyCreateOrConnectWithoutWorkspaceInput } from "../inputs/CompanyCreateOrConnectWithoutWorkspaceInput";
import { CompanyCreateWithoutWorkspaceInput } from "../inputs/CompanyCreateWithoutWorkspaceInput";
import { CompanyWhereUniqueInput } from "../inputs/CompanyWhereUniqueInput";

@TypeGraphQL.InputType("CompanyCreateNestedManyWithoutWorkspaceInput", {
  isAbstract: true
})
export class CompanyCreateNestedManyWithoutWorkspaceInput {
  @TypeGraphQL.Field(_type => [CompanyCreateWithoutWorkspaceInput], {
    nullable: true
  })
  create?: CompanyCreateWithoutWorkspaceInput[] | undefined;

  @TypeGraphQL.Field(_type => [CompanyCreateOrConnectWithoutWorkspaceInput], {
    nullable: true
  })
  connectOrCreate?: CompanyCreateOrConnectWithoutWorkspaceInput[] | undefined;

  @TypeGraphQL.Field(_type => CompanyCreateManyWorkspaceInputEnvelope, {
    nullable: true
  })
  createMany?: CompanyCreateManyWorkspaceInputEnvelope | undefined;

  @TypeGraphQL.Field(_type => [CompanyWhereUniqueInput], {
    nullable: true
  })
  connect?: CompanyWhereUniqueInput[] | undefined;
}
