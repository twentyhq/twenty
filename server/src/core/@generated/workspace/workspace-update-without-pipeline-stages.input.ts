import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import * as Validator from 'class-validator';
import { HideField } from '@nestjs/graphql';
import { WorkspaceMemberUpdateManyWithoutWorkspaceNestedInput } from '../workspace-member/workspace-member-update-many-without-workspace-nested.input';
import { CompanyUpdateManyWithoutWorkspaceNestedInput } from '../company/company-update-many-without-workspace-nested.input';
import { PersonUpdateManyWithoutWorkspaceNestedInput } from '../person/person-update-many-without-workspace-nested.input';
import { CommentThreadUpdateManyWithoutWorkspaceNestedInput } from '../comment-thread/comment-thread-update-many-without-workspace-nested.input';
import { CommentUpdateManyWithoutWorkspaceNestedInput } from '../comment/comment-update-many-without-workspace-nested.input';
import { PipelineUpdateManyWithoutWorkspaceNestedInput } from '../pipeline/pipeline-update-many-without-workspace-nested.input';
import { PipelineProgressUpdateManyWithoutWorkspaceNestedInput } from '../pipeline-progress/pipeline-progress-update-many-without-workspace-nested.input';

@InputType()
export class WorkspaceUpdateWithoutPipelineStagesInput {

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

    @Field(() => WorkspaceMemberUpdateManyWithoutWorkspaceNestedInput, {nullable:true})
    workspaceMember?: WorkspaceMemberUpdateManyWithoutWorkspaceNestedInput;

    @Field(() => CompanyUpdateManyWithoutWorkspaceNestedInput, {nullable:true})
    companies?: CompanyUpdateManyWithoutWorkspaceNestedInput;

    @Field(() => PersonUpdateManyWithoutWorkspaceNestedInput, {nullable:true})
    people?: PersonUpdateManyWithoutWorkspaceNestedInput;

    @Field(() => CommentThreadUpdateManyWithoutWorkspaceNestedInput, {nullable:true})
    commentThreads?: CommentThreadUpdateManyWithoutWorkspaceNestedInput;

    @Field(() => CommentUpdateManyWithoutWorkspaceNestedInput, {nullable:true})
    comments?: CommentUpdateManyWithoutWorkspaceNestedInput;

    @Field(() => PipelineUpdateManyWithoutWorkspaceNestedInput, {nullable:true})
    pipelines?: PipelineUpdateManyWithoutWorkspaceNestedInput;

    @Field(() => PipelineProgressUpdateManyWithoutWorkspaceNestedInput, {nullable:true})
    pipelineProgresses?: PipelineProgressUpdateManyWithoutWorkspaceNestedInput;
}
