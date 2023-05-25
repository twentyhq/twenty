import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { DateTimeFieldUpdateOperationsInput } from './DateTimeFieldUpdateOperationsInput';
import { NullableDateTimeFieldUpdateOperationsInput } from './NullableDateTimeFieldUpdateOperationsInput';
import { StringFieldUpdateOperationsInput } from './StringFieldUpdateOperationsInput';
import { UserUpdateOneRequiredWithoutWorkspaceMemberNestedInput } from './UserUpdateOneRequiredWithoutWorkspaceMemberNestedInput';
import { WorkspaceUpdateOneRequiredWithoutWorkspaceMemberNestedInput } from './WorkspaceUpdateOneRequiredWithoutWorkspaceMemberNestedInput';

@TypeGraphQL.InputType('WorkspaceMemberUpdateInput', {
  isAbstract: true,
})
export class WorkspaceMemberUpdateInput {
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
    (_type) => UserUpdateOneRequiredWithoutWorkspaceMemberNestedInput,
    {
      nullable: true,
    },
  )
  user?: UserUpdateOneRequiredWithoutWorkspaceMemberNestedInput | undefined;

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
