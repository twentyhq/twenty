import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { CompanyCreateManyAccountOwnerInputEnvelope } from "../inputs/CompanyCreateManyAccountOwnerInputEnvelope";
import { CompanyCreateOrConnectWithoutAccountOwnerInput } from "../inputs/CompanyCreateOrConnectWithoutAccountOwnerInput";
import { CompanyCreateWithoutAccountOwnerInput } from "../inputs/CompanyCreateWithoutAccountOwnerInput";
import { CompanyWhereUniqueInput } from "../inputs/CompanyWhereUniqueInput";

@TypeGraphQL.InputType("CompanyCreateNestedManyWithoutAccountOwnerInput", {
  isAbstract: true
})
export class CompanyCreateNestedManyWithoutAccountOwnerInput {
  @TypeGraphQL.Field(_type => [CompanyCreateWithoutAccountOwnerInput], {
    nullable: true
  })
  create?: CompanyCreateWithoutAccountOwnerInput[] | undefined;

  @TypeGraphQL.Field(_type => [CompanyCreateOrConnectWithoutAccountOwnerInput], {
    nullable: true
  })
  connectOrCreate?: CompanyCreateOrConnectWithoutAccountOwnerInput[] | undefined;

  @TypeGraphQL.Field(_type => CompanyCreateManyAccountOwnerInputEnvelope, {
    nullable: true
  })
  createMany?: CompanyCreateManyAccountOwnerInputEnvelope | undefined;

  @TypeGraphQL.Field(_type => [CompanyWhereUniqueInput], {
    nullable: true
  })
  connect?: CompanyWhereUniqueInput[] | undefined;
}
