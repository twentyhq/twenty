import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringFieldUpdateOperationsInput } from '../prisma/string-field-update-operations.input';
import { DateTimeFieldUpdateOperationsInput } from '../prisma/date-time-field-update-operations.input';
import { NullableDateTimeFieldUpdateOperationsInput } from '../prisma/nullable-date-time-field-update-operations.input';
import { WorkspaceMemberUncheckedUpdateManyWithoutWorkspaceNestedInput } from '../workspace-member/workspace-member-unchecked-update-many-without-workspace-nested.input';
import { CompanyUncheckedUpdateManyWithoutWorkspaceNestedInput } from '../company/company-unchecked-update-many-without-workspace-nested.input';

@InputType()
export class WorkspaceUncheckedUpdateWithoutPeopleInput {

    @Field(() => StringFieldUpdateOperationsInput, {nullable:true})
    id?: StringFieldUpdateOperationsInput;

    @Field(() => DateTimeFieldUpdateOperationsInput, {nullable:true})
    createdAt?: DateTimeFieldUpdateOperationsInput;

    @Field(() => DateTimeFieldUpdateOperationsInput, {nullable:true})
    updatedAt?: DateTimeFieldUpdateOperationsInput;

    @Field(() => NullableDateTimeFieldUpdateOperationsInput, {nullable:true})
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput;

    @Field(() => StringFieldUpdateOperationsInput, {nullable:true})
    domainName?: StringFieldUpdateOperationsInput;

    @Field(() => StringFieldUpdateOperationsInput, {nullable:true})
    displayName?: StringFieldUpdateOperationsInput;

    @Field(() => WorkspaceMemberUncheckedUpdateManyWithoutWorkspaceNestedInput, {nullable:true})
    WorkspaceMember?: WorkspaceMemberUncheckedUpdateManyWithoutWorkspaceNestedInput;

    @Field(() => CompanyUncheckedUpdateManyWithoutWorkspaceNestedInput, {nullable:true})
    companies?: CompanyUncheckedUpdateManyWithoutWorkspaceNestedInput;
}
