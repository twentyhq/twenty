import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { CompanyUpdateManyWithoutWorkspaceNestedInput } from '../inputs/CompanyUpdateManyWithoutWorkspaceNestedInput';
import { DateTimeFieldUpdateOperationsInput } from '../inputs/DateTimeFieldUpdateOperationsInput';
import { NullableDateTimeFieldUpdateOperationsInput } from '../inputs/NullableDateTimeFieldUpdateOperationsInput';
import { PersonUpdateManyWithoutWorkspaceNestedInput } from '../inputs/PersonUpdateManyWithoutWorkspaceNestedInput';
import { StringFieldUpdateOperationsInput } from '../inputs/StringFieldUpdateOperationsInput';
import { WorkspaceMemberUpdateManyWithoutWorkspaceNestedInput } from '../inputs/WorkspaceMemberUpdateManyWithoutWorkspaceNestedInput';

@TypeGraphQL.InputType('WorkspaceUpdateInput', {
  isAbstract: true,
})
export class WorkspaceUpdateInput {
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
  domainName?: StringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field((_type) => StringFieldUpdateOperationsInput, {
    nullable: true,
  })
  displayName?: StringFieldUpdateOperationsInput | undefined;

  @TypeGraphQL.Field(
    (_type) => WorkspaceMemberUpdateManyWithoutWorkspaceNestedInput,
    {
      nullable: true,
    },
  )
  WorkspaceMember?:
    | WorkspaceMemberUpdateManyWithoutWorkspaceNestedInput
    | undefined;

  @TypeGraphQL.Field((_type) => CompanyUpdateManyWithoutWorkspaceNestedInput, {
    nullable: true,
  })
  companies?: CompanyUpdateManyWithoutWorkspaceNestedInput | undefined;

  @TypeGraphQL.Field((_type) => PersonUpdateManyWithoutWorkspaceNestedInput, {
    nullable: true,
  })
  people?: PersonUpdateManyWithoutWorkspaceNestedInput | undefined;
}
