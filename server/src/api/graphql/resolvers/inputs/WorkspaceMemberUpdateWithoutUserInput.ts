import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { DateTimeFieldUpdateOperationsInput } from '../inputs/DateTimeFieldUpdateOperationsInput';
import { NullableDateTimeFieldUpdateOperationsInput } from '../inputs/NullableDateTimeFieldUpdateOperationsInput';
import { StringFieldUpdateOperationsInput } from '../inputs/StringFieldUpdateOperationsInput';
import { WorkspaceUpdateOneRequiredWithoutWorkspaceMemberNestedInput } from '../inputs/WorkspaceUpdateOneRequiredWithoutWorkspaceMemberNestedInput';

@TypeGraphQL.InputType('WorkspaceMemberUpdateWithoutUserInput', {
  isAbstract: true,
})
export class WorkspaceMemberUpdateWithoutUserInput {
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

  @TypeGraphQL.Field(
    (_type) => WorkspaceUpdateOneRequiredWithoutWorkspaceMemberNestedInput,
    {
      nullable: true,
    },
  )
  workspace?:
    | WorkspaceUpdateOneRequiredWithoutWorkspaceMemberNestedInput
    | undefined;
}
