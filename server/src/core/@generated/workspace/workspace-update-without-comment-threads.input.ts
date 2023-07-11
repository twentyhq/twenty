import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringFieldUpdateOperationsInput } from '../prisma/string-field-update-operations.input';
import { NullableStringFieldUpdateOperationsInput } from '../prisma/nullable-string-field-update-operations.input';
import { NullableDateTimeFieldUpdateOperationsInput } from '../prisma/nullable-date-time-field-update-operations.input';
import { HideField } from '@nestjs/graphql';
import { DateTimeFieldUpdateOperationsInput } from '../prisma/date-time-field-update-operations.input';
import { WorkspaceMemberUpdateManyWithoutWorkspaceNestedInput } from '../workspace-member/workspace-member-update-many-without-workspace-nested.input';
import { CompanyUpdateManyWithoutWorkspaceNestedInput } from '../company/company-update-many-without-workspace-nested.input';
import { PersonUpdateManyWithoutWorkspaceNestedInput } from '../person/person-update-many-without-workspace-nested.input';
import { CommentUpdateManyWithoutWorkspaceNestedInput } from '../comment/comment-update-many-without-workspace-nested.input';
import { PipelineUpdateManyWithoutWorkspaceNestedInput } from '../pipeline/pipeline-update-many-without-workspace-nested.input';
import { PipelineStageUpdateManyWithoutWorkspaceNestedInput } from '../pipeline-stage/pipeline-stage-update-many-without-workspace-nested.input';
import { PipelineProgressUpdateManyWithoutWorkspaceNestedInput } from '../pipeline-progress/pipeline-progress-update-many-without-workspace-nested.input';

@InputType()
export class WorkspaceUpdateWithoutCommentThreadsInput {

    @Field(() => StringFieldUpdateOperationsInput, {nullable:true})
    id?: StringFieldUpdateOperationsInput;

    @Field(() => NullableStringFieldUpdateOperationsInput, {nullable:true})
    domainName?: NullableStringFieldUpdateOperationsInput;

    @Field(() => NullableStringFieldUpdateOperationsInput, {nullable:true})
    displayName?: NullableStringFieldUpdateOperationsInput;

    @Field(() => NullableStringFieldUpdateOperationsInput, {nullable:true})
    logo?: NullableStringFieldUpdateOperationsInput;

    @Field(() => NullableStringFieldUpdateOperationsInput, {nullable:true})
    inviteHash?: NullableStringFieldUpdateOperationsInput;

    @HideField()
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput;

    @Field(() => DateTimeFieldUpdateOperationsInput, {nullable:true})
    createdAt?: DateTimeFieldUpdateOperationsInput;

    @Field(() => DateTimeFieldUpdateOperationsInput, {nullable:true})
    updatedAt?: DateTimeFieldUpdateOperationsInput;

    @Field(() => WorkspaceMemberUpdateManyWithoutWorkspaceNestedInput, {nullable:true})
    workspaceMember?: WorkspaceMemberUpdateManyWithoutWorkspaceNestedInput;

    @Field(() => CompanyUpdateManyWithoutWorkspaceNestedInput, {nullable:true})
    companies?: CompanyUpdateManyWithoutWorkspaceNestedInput;

    @Field(() => PersonUpdateManyWithoutWorkspaceNestedInput, {nullable:true})
    people?: PersonUpdateManyWithoutWorkspaceNestedInput;

    @Field(() => CommentUpdateManyWithoutWorkspaceNestedInput, {nullable:true})
    comments?: CommentUpdateManyWithoutWorkspaceNestedInput;

    @Field(() => PipelineUpdateManyWithoutWorkspaceNestedInput, {nullable:true})
    pipelines?: PipelineUpdateManyWithoutWorkspaceNestedInput;

    @Field(() => PipelineStageUpdateManyWithoutWorkspaceNestedInput, {nullable:true})
    pipelineStages?: PipelineStageUpdateManyWithoutWorkspaceNestedInput;

    @Field(() => PipelineProgressUpdateManyWithoutWorkspaceNestedInput, {nullable:true})
    pipelineProgresses?: PipelineProgressUpdateManyWithoutWorkspaceNestedInput;
}
