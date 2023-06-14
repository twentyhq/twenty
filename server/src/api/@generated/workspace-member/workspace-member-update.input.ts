import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringFieldUpdateOperationsInput } from '../prisma/string-field-update-operations.input';
import { DateTimeFieldUpdateOperationsInput } from '../prisma/date-time-field-update-operations.input';
import { NullableDateTimeFieldUpdateOperationsInput } from '../prisma/nullable-date-time-field-update-operations.input';
import { UserUpdateOneRequiredWithoutWorkspaceMemberNestedInput } from '../user/user-update-one-required-without-workspace-member-nested.input';
import { WorkspaceUpdateOneRequiredWithoutWorkspaceMemberNestedInput } from '../workspace/workspace-update-one-required-without-workspace-member-nested.input';
import { HideField } from '@nestjs/graphql';

@InputType()
export class WorkspaceMemberUpdateInput {
  @Field(() => StringFieldUpdateOperationsInput, { nullable: true })
  id?: StringFieldUpdateOperationsInput;

  @Field(() => DateTimeFieldUpdateOperationsInput, { nullable: true })
  createdAt?: DateTimeFieldUpdateOperationsInput;

  @Field(() => DateTimeFieldUpdateOperationsInput, { nullable: true })
  updatedAt?: DateTimeFieldUpdateOperationsInput;

  @Field(() => NullableDateTimeFieldUpdateOperationsInput, { nullable: true })
  deletedAt?: NullableDateTimeFieldUpdateOperationsInput;

  @Field(() => UserUpdateOneRequiredWithoutWorkspaceMemberNestedInput, {
    nullable: true,
  })
  user?: UserUpdateOneRequiredWithoutWorkspaceMemberNestedInput;

  @HideField()
  workspace?: WorkspaceUpdateOneRequiredWithoutWorkspaceMemberNestedInput;
}
