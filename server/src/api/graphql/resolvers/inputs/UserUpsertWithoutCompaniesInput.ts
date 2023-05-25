import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { UserCreateWithoutCompaniesInput } from "../inputs/UserCreateWithoutCompaniesInput";
import { UserUpdateWithoutCompaniesInput } from "../inputs/UserUpdateWithoutCompaniesInput";

@TypeGraphQL.InputType("UserUpsertWithoutCompaniesInput", {
  isAbstract: true
})
export class UserUpsertWithoutCompaniesInput {
  @TypeGraphQL.Field(_type => UserUpdateWithoutCompaniesInput, {
    nullable: false
  })
  update!: UserUpdateWithoutCompaniesInput;

  @TypeGraphQL.Field(_type => UserCreateWithoutCompaniesInput, {
    nullable: false
  })
  create!: UserCreateWithoutCompaniesInput;
}
