import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import * as Validator from 'class-validator';
import { HideField } from '@nestjs/graphql';
import { WorkspaceMemberUncheckedCreateNestedManyWithoutWorkspaceInput } from '../workspace-member/workspace-member-unchecked-create-nested-many-without-workspace.input';
import { CompanyUncheckedCreateNestedManyWithoutWorkspaceInput } from '../company/company-unchecked-create-nested-many-without-workspace.input';
import { PersonUncheckedCreateNestedManyWithoutWorkspaceInput } from '../person/person-unchecked-create-nested-many-without-workspace.input';
import { CommentThreadUncheckedCreateNestedManyWithoutWorkspaceInput } from '../comment-thread/comment-thread-unchecked-create-nested-many-without-workspace.input';
import { CommentUncheckedCreateNestedManyWithoutWorkspaceInput } from '../comment/comment-unchecked-create-nested-many-without-workspace.input';
import { PipelineUncheckedCreateNestedManyWithoutWorkspaceInput } from '../pipeline/pipeline-unchecked-create-nested-many-without-workspace.input';
import { PipelineProgressUncheckedCreateNestedManyWithoutWorkspaceInput } from '../pipeline-progress/pipeline-progress-unchecked-create-nested-many-without-workspace.input';

@InputType()
export class WorkspaceUncheckedCreateWithoutPipelineStagesInput {

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    @Validator.IsOptional()
    id?: string;

    @Field(() => String, {nullable:false})
    @Validator.IsString()
    domainName!: string;

    @Field(() => String, {nullable:false})
    @Validator.IsString()
    displayName!: string;

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

    @Field(() => WorkspaceMemberUncheckedCreateNestedManyWithoutWorkspaceInput, {nullable:true})
    workspaceMember?: WorkspaceMemberUncheckedCreateNestedManyWithoutWorkspaceInput;

    @Field(() => CompanyUncheckedCreateNestedManyWithoutWorkspaceInput, {nullable:true})
    companies?: CompanyUncheckedCreateNestedManyWithoutWorkspaceInput;

    @Field(() => PersonUncheckedCreateNestedManyWithoutWorkspaceInput, {nullable:true})
    people?: PersonUncheckedCreateNestedManyWithoutWorkspaceInput;

    @Field(() => CommentThreadUncheckedCreateNestedManyWithoutWorkspaceInput, {nullable:true})
    commentThreads?: CommentThreadUncheckedCreateNestedManyWithoutWorkspaceInput;

    @Field(() => CommentUncheckedCreateNestedManyWithoutWorkspaceInput, {nullable:true})
    comments?: CommentUncheckedCreateNestedManyWithoutWorkspaceInput;

    @Field(() => PipelineUncheckedCreateNestedManyWithoutWorkspaceInput, {nullable:true})
    pipelines?: PipelineUncheckedCreateNestedManyWithoutWorkspaceInput;

    @Field(() => PipelineProgressUncheckedCreateNestedManyWithoutWorkspaceInput, {nullable:true})
    pipelineProgresses?: PipelineProgressUncheckedCreateNestedManyWithoutWorkspaceInput;
}
