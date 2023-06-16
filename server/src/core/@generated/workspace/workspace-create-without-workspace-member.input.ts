import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CompanyCreateNestedManyWithoutWorkspaceInput } from '../company/company-create-nested-many-without-workspace.input';
import { PersonCreateNestedManyWithoutWorkspaceInput } from '../person/person-create-nested-many-without-workspace.input';
import { CommentThreadCreateNestedManyWithoutWorkspaceInput } from '../comment-thread/comment-thread-create-nested-many-without-workspace.input';
import { CommentCreateNestedManyWithoutWorkspaceInput } from '../comment/comment-create-nested-many-without-workspace.input';
import { PipelineCreateNestedManyWithoutWorkspaceInput } from '../pipeline/pipeline-create-nested-many-without-workspace.input';
import { PipelineStageCreateNestedManyWithoutWorkspaceInput } from '../pipeline-stage/pipeline-stage-create-nested-many-without-workspace.input';
import { PipelineProgressCreateNestedManyWithoutWorkspaceInput } from '../pipeline-progress/pipeline-progress-create-nested-many-without-workspace.input';

@InputType()
export class WorkspaceCreateWithoutWorkspaceMemberInput {

    @Field(() => String, {nullable:false})
    id!: string;

    @Field(() => Date, {nullable:true})
    createdAt?: Date | string;

    @Field(() => Date, {nullable:true})
    updatedAt?: Date | string;

    @Field(() => Date, {nullable:true})
    deletedAt?: Date | string;

    @Field(() => String, {nullable:false})
    domainName!: string;

    @Field(() => String, {nullable:false})
    displayName!: string;

    @Field(() => String, {nullable:true})
    logo?: string;

    @Field(() => CompanyCreateNestedManyWithoutWorkspaceInput, {nullable:true})
    companies?: CompanyCreateNestedManyWithoutWorkspaceInput;

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
