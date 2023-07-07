import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringFieldUpdateOperationsInput } from '../prisma/string-field-update-operations.input';
import { NullableStringFieldUpdateOperationsInput } from '../prisma/nullable-string-field-update-operations.input';
import { NullableDateTimeFieldUpdateOperationsInput } from '../prisma/nullable-date-time-field-update-operations.input';
import { HideField } from '@nestjs/graphql';
import { DateTimeFieldUpdateOperationsInput } from '../prisma/date-time-field-update-operations.input';
import { WorkspaceMemberUncheckedUpdateManyWithoutWorkspaceNestedInput } from '../workspace-member/workspace-member-unchecked-update-many-without-workspace-nested.input';
import { PersonUncheckedUpdateManyWithoutWorkspaceNestedInput } from '../person/person-unchecked-update-many-without-workspace-nested.input';
import { CommentThreadUncheckedUpdateManyWithoutWorkspaceNestedInput } from '../comment-thread/comment-thread-unchecked-update-many-without-workspace-nested.input';
import { CommentUncheckedUpdateManyWithoutWorkspaceNestedInput } from '../comment/comment-unchecked-update-many-without-workspace-nested.input';
import { PipelineUncheckedUpdateManyWithoutWorkspaceNestedInput } from '../pipeline/pipeline-unchecked-update-many-without-workspace-nested.input';
import { PipelineStageUncheckedUpdateManyWithoutWorkspaceNestedInput } from '../pipeline-stage/pipeline-stage-unchecked-update-many-without-workspace-nested.input';
import { PipelineProgressUncheckedUpdateManyWithoutWorkspaceNestedInput } from '../pipeline-progress/pipeline-progress-unchecked-update-many-without-workspace-nested.input';

@InputType()
export class WorkspaceUncheckedUpdateWithoutCompaniesInput {

    @Field(() => StringFieldUpdateOperationsInput, {nullable:true})
    id?: StringFieldUpdateOperationsInput;

    @Field(() => NullableStringFieldUpdateOperationsInput, {nullable:true})
    domainName?: NullableStringFieldUpdateOperationsInput;

    @Field(() => NullableStringFieldUpdateOperationsInput, {nullable:true})
    displayName?: NullableStringFieldUpdateOperationsInput;

    @Field(() => NullableStringFieldUpdateOperationsInput, {nullable:true})
    logo?: NullableStringFieldUpdateOperationsInput;

    @HideField()
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput;

    @Field(() => DateTimeFieldUpdateOperationsInput, {nullable:true})
    createdAt?: DateTimeFieldUpdateOperationsInput;

    @Field(() => DateTimeFieldUpdateOperationsInput, {nullable:true})
    updatedAt?: DateTimeFieldUpdateOperationsInput;

    @Field(() => WorkspaceMemberUncheckedUpdateManyWithoutWorkspaceNestedInput, {nullable:true})
    workspaceMember?: WorkspaceMemberUncheckedUpdateManyWithoutWorkspaceNestedInput;

    @Field(() => PersonUncheckedUpdateManyWithoutWorkspaceNestedInput, {nullable:true})
    people?: PersonUncheckedUpdateManyWithoutWorkspaceNestedInput;

    @Field(() => CommentThreadUncheckedUpdateManyWithoutWorkspaceNestedInput, {nullable:true})
    commentThreads?: CommentThreadUncheckedUpdateManyWithoutWorkspaceNestedInput;

    @Field(() => CommentUncheckedUpdateManyWithoutWorkspaceNestedInput, {nullable:true})
    comments?: CommentUncheckedUpdateManyWithoutWorkspaceNestedInput;

    @Field(() => PipelineUncheckedUpdateManyWithoutWorkspaceNestedInput, {nullable:true})
    pipelines?: PipelineUncheckedUpdateManyWithoutWorkspaceNestedInput;

    @Field(() => PipelineStageUncheckedUpdateManyWithoutWorkspaceNestedInput, {nullable:true})
    pipelineStages?: PipelineStageUncheckedUpdateManyWithoutWorkspaceNestedInput;

    @Field(() => PipelineProgressUncheckedUpdateManyWithoutWorkspaceNestedInput, {nullable:true})
    pipelineProgresses?: PipelineProgressUncheckedUpdateManyWithoutWorkspaceNestedInput;
}
