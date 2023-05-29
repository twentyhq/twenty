import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringFieldUpdateOperationsInput } from '../prisma/string-field-update-operations.input';
import { DateTimeFieldUpdateOperationsInput } from '../prisma/date-time-field-update-operations.input';
import { NullableDateTimeFieldUpdateOperationsInput } from '../prisma/nullable-date-time-field-update-operations.input';
import { NullableStringFieldUpdateOperationsInput } from '../prisma/nullable-string-field-update-operations.input';
import { WorkspaceMemberUpdateManyWithoutWorkspaceNestedInput } from '../workspace-member/workspace-member-update-many-without-workspace-nested.input';
import { PersonUpdateManyWithoutWorkspaceNestedInput } from '../person/person-update-many-without-workspace-nested.input';

@InputType()
export class WorkspaceUpdateWithoutCompaniesInput {
  @Field(() => StringFieldUpdateOperationsInput, { nullable: true })
  id?: StringFieldUpdateOperationsInput;

  @Field(() => DateTimeFieldUpdateOperationsInput, { nullable: true })
  createdAt?: DateTimeFieldUpdateOperationsInput;

  @Field(() => DateTimeFieldUpdateOperationsInput, { nullable: true })
  updatedAt?: DateTimeFieldUpdateOperationsInput;

  @Field(() => NullableDateTimeFieldUpdateOperationsInput, { nullable: true })
  deletedAt?: NullableDateTimeFieldUpdateOperationsInput;

  @Field(() => StringFieldUpdateOperationsInput, { nullable: true })
  domainName?: StringFieldUpdateOperationsInput;

  @Field(() => StringFieldUpdateOperationsInput, { nullable: true })
  displayName?: StringFieldUpdateOperationsInput;

  @Field(() => NullableStringFieldUpdateOperationsInput, { nullable: true })
  logo?: NullableStringFieldUpdateOperationsInput;

  @Field(() => WorkspaceMemberUpdateManyWithoutWorkspaceNestedInput, {
    nullable: true,
  })
  WorkspaceMember?: WorkspaceMemberUpdateManyWithoutWorkspaceNestedInput;

  @Field(() => PersonUpdateManyWithoutWorkspaceNestedInput, { nullable: true })
  people?: PersonUpdateManyWithoutWorkspaceNestedInput;
}
