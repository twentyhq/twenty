import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import * as Validator from 'class-validator';
import { HideField } from '@nestjs/graphql';
import { WorkspaceMemberUncheckedUpdateManyWithoutWorkspaceNestedInput } from '../workspace-member/workspace-member-unchecked-update-many-without-workspace-nested.input';
import { CompanyUncheckedUpdateManyWithoutWorkspaceNestedInput } from '../company/company-unchecked-update-many-without-workspace-nested.input';
import { PersonUncheckedUpdateManyWithoutWorkspaceNestedInput } from '../person/person-unchecked-update-many-without-workspace-nested.input';
import { CommentThreadUncheckedUpdateManyWithoutWorkspaceNestedInput } from '../comment-thread/comment-thread-unchecked-update-many-without-workspace-nested.input';
import { CommentUncheckedUpdateManyWithoutWorkspaceNestedInput } from '../comment/comment-unchecked-update-many-without-workspace-nested.input';
import { PipelineUncheckedUpdateManyWithoutWorkspaceNestedInput } from '../pipeline/pipeline-unchecked-update-many-without-workspace-nested.input';
import { PipelineStageUncheckedUpdateManyWithoutWorkspaceNestedInput } from '../pipeline-stage/pipeline-stage-unchecked-update-many-without-workspace-nested.input';
import { PipelineProgressUncheckedUpdateManyWithoutWorkspaceNestedInput } from '../pipeline-progress/pipeline-progress-unchecked-update-many-without-workspace-nested.input';

@InputType()
export class WorkspaceUncheckedUpdateInput {

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    @Validator.IsOptional()
    id?: string;

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    @Validator.IsOptional()
    domainName?: string;

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    @Validator.IsOptional()
    displayName?: string;

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    @Validator.IsOptional()
    logo?: string;

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    @Validator.IsOptional()
    inviteHash?: string;

    @HideField()
    deletedAt?: Date | string;

    @Field(() => Date, {nullable:true})
    createdAt?: Date | string;

    @Field(() => Date, {nullable:true})
    updatedAt?: Date | string;

    @Field(() => WorkspaceMemberUncheckedUpdateManyWithoutWorkspaceNestedInput, {nullable:true})
    workspaceMember?: WorkspaceMemberUncheckedUpdateManyWithoutWorkspaceNestedInput;

    @Field(() => CompanyUncheckedUpdateManyWithoutWorkspaceNestedInput, {nullable:true})
    companies?: CompanyUncheckedUpdateManyWithoutWorkspaceNestedInput;

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
