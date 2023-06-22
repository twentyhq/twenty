import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceMemberUncheckedCreateNestedManyWithoutWorkspaceInput } from '../workspace-member/workspace-member-unchecked-create-nested-many-without-workspace.input';
import { CompanyUncheckedCreateNestedManyWithoutWorkspaceInput } from '../company/company-unchecked-create-nested-many-without-workspace.input';
import { PersonUncheckedCreateNestedManyWithoutWorkspaceInput } from '../person/person-unchecked-create-nested-many-without-workspace.input';
import { CommentThreadUncheckedCreateNestedManyWithoutWorkspaceInput } from '../comment-thread/comment-thread-unchecked-create-nested-many-without-workspace.input';
import { PipelineUncheckedCreateNestedManyWithoutWorkspaceInput } from '../pipeline/pipeline-unchecked-create-nested-many-without-workspace.input';
import { PipelineStageUncheckedCreateNestedManyWithoutWorkspaceInput } from '../pipeline-stage/pipeline-stage-unchecked-create-nested-many-without-workspace.input';
import { PipelineProgressUncheckedCreateNestedManyWithoutWorkspaceInput } from '../pipeline-progress/pipeline-progress-unchecked-create-nested-many-without-workspace.input';

@InputType()
export class WorkspaceUncheckedCreateWithoutCommentsInput {

    @Field(() => String, {nullable:true})
    id?: string;

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

    @Field(() => WorkspaceMemberUncheckedCreateNestedManyWithoutWorkspaceInput, {nullable:true})
    workspaceMember?: WorkspaceMemberUncheckedCreateNestedManyWithoutWorkspaceInput;

    @Field(() => CompanyUncheckedCreateNestedManyWithoutWorkspaceInput, {nullable:true})
    companies?: CompanyUncheckedCreateNestedManyWithoutWorkspaceInput;

    @Field(() => PersonUncheckedCreateNestedManyWithoutWorkspaceInput, {nullable:true})
    people?: PersonUncheckedCreateNestedManyWithoutWorkspaceInput;

    @Field(() => CommentThreadUncheckedCreateNestedManyWithoutWorkspaceInput, {nullable:true})
    commentThreads?: CommentThreadUncheckedCreateNestedManyWithoutWorkspaceInput;

    @Field(() => PipelineUncheckedCreateNestedManyWithoutWorkspaceInput, {nullable:true})
    pipelines?: PipelineUncheckedCreateNestedManyWithoutWorkspaceInput;

    @Field(() => PipelineStageUncheckedCreateNestedManyWithoutWorkspaceInput, {nullable:true})
    pipelineStages?: PipelineStageUncheckedCreateNestedManyWithoutWorkspaceInput;

    @Field(() => PipelineProgressUncheckedCreateNestedManyWithoutWorkspaceInput, {nullable:true})
    pipelineProgresses?: PipelineProgressUncheckedCreateNestedManyWithoutWorkspaceInput;
}
