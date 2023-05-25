import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { CompanyCreateManyAccountOwnerInputEnvelope } from "../inputs/CompanyCreateManyAccountOwnerInputEnvelope";
import { CompanyCreateOrConnectWithoutAccountOwnerInput } from "../inputs/CompanyCreateOrConnectWithoutAccountOwnerInput";
import { CompanyCreateWithoutAccountOwnerInput } from "../inputs/CompanyCreateWithoutAccountOwnerInput";
import { CompanyScalarWhereInput } from "../inputs/CompanyScalarWhereInput";
import { CompanyUpdateManyWithWhereWithoutAccountOwnerInput } from "../inputs/CompanyUpdateManyWithWhereWithoutAccountOwnerInput";
import { CompanyUpdateWithWhereUniqueWithoutAccountOwnerInput } from "../inputs/CompanyUpdateWithWhereUniqueWithoutAccountOwnerInput";
import { CompanyUpsertWithWhereUniqueWithoutAccountOwnerInput } from "../inputs/CompanyUpsertWithWhereUniqueWithoutAccountOwnerInput";
import { CompanyWhereUniqueInput } from "../inputs/CompanyWhereUniqueInput";

@TypeGraphQL.InputType("CompanyUpdateManyWithoutAccountOwnerNestedInput", {
  isAbstract: true
})
export class CompanyUpdateManyWithoutAccountOwnerNestedInput {
  @TypeGraphQL.Field(_type => [CompanyCreateWithoutAccountOwnerInput], {
    nullable: true
  })
  create?: CompanyCreateWithoutAccountOwnerInput[] | undefined;

  @TypeGraphQL.Field(_type => [CompanyCreateOrConnectWithoutAccountOwnerInput], {
    nullable: true
  })
  connectOrCreate?: CompanyCreateOrConnectWithoutAccountOwnerInput[] | undefined;

  @TypeGraphQL.Field(_type => [CompanyUpsertWithWhereUniqueWithoutAccountOwnerInput], {
    nullable: true
  })
  upsert?: CompanyUpsertWithWhereUniqueWithoutAccountOwnerInput[] | undefined;

  @TypeGraphQL.Field(_type => CompanyCreateManyAccountOwnerInputEnvelope, {
    nullable: true
  })
  createMany?: CompanyCreateManyAccountOwnerInputEnvelope | undefined;

  @TypeGraphQL.Field(_type => [CompanyWhereUniqueInput], {
    nullable: true
  })
  set?: CompanyWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [CompanyWhereUniqueInput], {
    nullable: true
  })
  disconnect?: CompanyWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [CompanyWhereUniqueInput], {
    nullable: true
  })
  delete?: CompanyWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [CompanyWhereUniqueInput], {
    nullable: true
  })
  connect?: CompanyWhereUniqueInput[] | undefined;

  @TypeGraphQL.Field(_type => [CompanyUpdateWithWhereUniqueWithoutAccountOwnerInput], {
    nullable: true
  })
  update?: CompanyUpdateWithWhereUniqueWithoutAccountOwnerInput[] | undefined;

  @TypeGraphQL.Field(_type => [CompanyUpdateManyWithWhereWithoutAccountOwnerInput], {
    nullable: true
  })
  updateMany?: CompanyUpdateManyWithWhereWithoutAccountOwnerInput[] | undefined;

  @TypeGraphQL.Field(_type => [CompanyScalarWhereInput], {
    nullable: true
  })
  deleteMany?: CompanyScalarWhereInput[] | undefined;
}
