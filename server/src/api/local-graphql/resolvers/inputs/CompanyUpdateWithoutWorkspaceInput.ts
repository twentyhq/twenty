import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { DateTimeFieldUpdateOperationsInput } from './DateTimeFieldUpdateOperationsInput';
import { NullableDateTimeFieldUpdateOperationsInput } from './NullableDateTimeFieldUpdateOperationsInput';
import { NullableIntFieldUpdateOperationsInput } from './NullableIntFieldUpdateOperationsInput';
import { PersonUpdateManyWithoutCompanyNestedInput } from './PersonUpdateManyWithoutCompanyNestedInput';
import { StringFieldUpdateOperationsInput } from './StringFieldUpdateOperationsInput';
import { UserUpdateOneWithoutCompaniesNestedInput } from './UserUpdateOneWithoutCompaniesNestedInput';

@TypeGraphQL.InputType('CompanyUpdateWithoutWorkspaceInput', {
  isAbstract: true,
})
export class CompanyUpdateWithoutWorkspaceInput {
  @TypeGraphQL.Field((_type) => StringFieldUpdateOperationsInput, {
    nullable: true,
  })
  id?: StringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => DateTimeFieldUpdateOperationsInput, {
    nullable: true,
  })
  createdAt?: DateTimeFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => DateTimeFieldUpdateOperationsInput, {
    nullable: true,
  })
  updatedAt?: DateTimeFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => NullableDateTimeFieldUpdateOperationsInput, {
    nullable: true,
  })
  deletedAt?: NullableDateTimeFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => StringFieldUpdateOperationsInput, {
    nullable: true,
  })
  name?: StringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => StringFieldUpdateOperationsInput, {
    nullable: true,
  })
  domainName?: StringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => StringFieldUpdateOperationsInput, {
    nullable: true,
  })
  address?: StringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => NullableIntFieldUpdateOperationsInput, {
    nullable: true,
  })
  employees?: NullableIntFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => UserUpdateOneWithoutCompaniesNestedInput, {
    nullable: true,
  })
  accountOwner?: UserUpdateOneWithoutCompaniesNestedInput | undefined;

  @TypeGraphQL.Field((_type) => PersonUpdateManyWithoutCompanyNestedInput, {
    nullable: true,
  })
  people?: PersonUpdateManyWithoutCompanyNestedInput | undefined;
}
