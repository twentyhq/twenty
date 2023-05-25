import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../../scalars";
import { DateTimeFieldUpdateOperationsInput } from "../inputs/DateTimeFieldUpdateOperationsInput";
import { NullableDateTimeFieldUpdateOperationsInput } from "../inputs/NullableDateTimeFieldUpdateOperationsInput";
import { NullableIntFieldUpdateOperationsInput } from "../inputs/NullableIntFieldUpdateOperationsInput";
import { PersonUpdateManyWithoutCompanyNestedInput } from "../inputs/PersonUpdateManyWithoutCompanyNestedInput";
import { StringFieldUpdateOperationsInput } from "../inputs/StringFieldUpdateOperationsInput";
import { UserUpdateOneWithoutCompaniesNestedInput } from "../inputs/UserUpdateOneWithoutCompaniesNestedInput";
import { WorkspaceUpdateOneRequiredWithoutCompaniesNestedInput } from "../inputs/WorkspaceUpdateOneRequiredWithoutCompaniesNestedInput";

@TypeGraphQL.InputType("CompanyUpdateInput", {
  isAbstract: true
})
export class CompanyUpdateInput {
  @TypeGraphQL.Field(_type => StringFieldUpdateOperationsInput, {
    nullable: true
  })
  id?: StringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => DateTimeFieldUpdateOperationsInput, {
    nullable: true
  })
  createdAt?: DateTimeFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => DateTimeFieldUpdateOperationsInput, {
    nullable: true
  })
  updatedAt?: DateTimeFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => NullableDateTimeFieldUpdateOperationsInput, {
    nullable: true
  })
  deletedAt?: NullableDateTimeFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => StringFieldUpdateOperationsInput, {
    nullable: true
  })
  name?: StringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => StringFieldUpdateOperationsInput, {
    nullable: true
  })
  domainName?: StringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => StringFieldUpdateOperationsInput, {
    nullable: true
  })
  address?: StringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => NullableIntFieldUpdateOperationsInput, {
    nullable: true
  })
  employees?: NullableIntFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(_type => UserUpdateOneWithoutCompaniesNestedInput, {
    nullable: true
  })
  accountOwner?: UserUpdateOneWithoutCompaniesNestedInput | undefined;

  @TypeGraphQL.Field(_type => PersonUpdateManyWithoutCompanyNestedInput, {
    nullable: true
  })
  people?: PersonUpdateManyWithoutCompanyNestedInput | undefined;

  @TypeGraphQL.Field(_type => WorkspaceUpdateOneRequiredWithoutCompaniesNestedInput, {
    nullable: true
  })
  workspace?: WorkspaceUpdateOneRequiredWithoutCompaniesNestedInput | undefined;
}
