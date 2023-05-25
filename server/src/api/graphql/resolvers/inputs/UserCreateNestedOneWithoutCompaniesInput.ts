import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { UserCreateOrConnectWithoutCompaniesInput } from "../inputs/UserCreateOrConnectWithoutCompaniesInput";
import { UserCreateWithoutCompaniesInput } from "../inputs/UserCreateWithoutCompaniesInput";
import { UserWhereUniqueInput } from "../inputs/UserWhereUniqueInput";

@TypeGraphQL.InputType("UserCreateNestedOneWithoutCompaniesInput", {
  isAbstract: true
})
export class UserCreateNestedOneWithoutCompaniesInput {
  @TypeGraphQL.Field(_type => UserCreateWithoutCompaniesInput, {
    nullable: true
  })
  create?: UserCreateWithoutCompaniesInput | undefined;

  @TypeGraphQL.Field(_type => UserCreateOrConnectWithoutCompaniesInput, {
    nullable: true
  })
  connectOrCreate?: UserCreateOrConnectWithoutCompaniesInput | undefined;

  @TypeGraphQL.Field(_type => UserWhereUniqueInput, {
    nullable: true
  })
  connect?: UserWhereUniqueInput | undefined;
}
