import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import * as Validator from 'class-validator';
import { HideField } from '@nestjs/graphql';
import { WorkspaceMemberCreateNestedManyWithoutWorkspaceInput } from '../workspace-member/workspace-member-create-nested-many-without-workspace.input';
import { PersonCreateNestedManyWithoutWorkspaceInput } from '../person/person-create-nested-many-without-workspace.input';
import { CommentThreadCreateNestedManyWithoutWorkspaceInput } from '../comment-thread/comment-thread-create-nested-many-without-workspace.input';
import { CommentCreateNestedManyWithoutWorkspaceInput } from '../comment/comment-create-nested-many-without-workspace.input';
import { PipelineCreateNestedManyWithoutWorkspaceInput } from '../pipeline/pipeline-create-nested-many-without-workspace.input';
import { PipelineStageCreateNestedManyWithoutWorkspaceInput } from '../pipeline-stage/pipeline-stage-create-nested-many-without-workspace.input';
import { PipelineProgressCreateNestedManyWithoutWorkspaceInput } from '../pipeline-progress/pipeline-progress-create-nested-many-without-workspace.input';

@InputType()
export class WorkspaceCreateWithoutCompaniesInput {

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

    @HideField()
    deletedAt?: Date | string;

    @Field(() => Date, {nullable:true})
    createdAt?: Date | string;

    @Field(() => Date, {nullable:true})
    updatedAt?: Date | string;

    @Field(() => WorkspaceMemberCreateNestedManyWithoutWorkspaceInput, {nullable:true})
    workspaceMember?: WorkspaceMemberCreateNestedManyWithoutWorkspaceInput;

    @Field(() => PersonCreateNestedManyWithoutWorkspaceInput, {nullable:true})
    people?: PersonCreateNestedManyWithoutWorkspaceInput;

    @Field(() => CommentThreadCreateNestedManyWithoutWorkspaceInput, {nullable:true})
    commentThreads?: CommentThreadCreateNestedManyWithoutWorkspaceInput;

    @Field(() => CommentCreateNestedManyWithoutWorkspaceInput, {nullable:true})
    comments?: CommentCreateNestedManyWithoutWorkspaceInput;

    @Field(() => PipelineCreateNestedManyWithoutWorkspaceInput, {nullable:true})
    pipelines?: PipelineCreateNestedManyWithoutWorkspaceInput;

    @Field(() => PipelineStageCreateNestedManyWithoutWorkspaceInput, {nullable:true})
    pipelineStages?: PipelineStageCreateNestedManyWithoutWorkspaceInput;

    @Field(() => PipelineProgressCreateNestedManyWithoutWorkspaceInput, {nullable:true})
    pipelineProgresses?: PipelineProgressCreateNestedManyWithoutWorkspaceInput;
}
