import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { ID } from '@nestjs/graphql';
import { HideField } from '@nestjs/graphql';
import { WorkspaceMember } from '../workspace-member/workspace-member.model';
import { Company } from '../company/company.model';
import { Person } from '../person/person.model';
import { CommentThread } from '../comment-thread/comment-thread.model';
import { Comment } from '../comment/comment.model';
import { Pipeline } from '../pipeline/pipeline.model';
import { PipelineStage } from '../pipeline-stage/pipeline-stage.model';
import { PipelineProgress } from '../pipeline-progress/pipeline-progress.model';
import { WorkspaceCount } from './workspace-count.output';

@ObjectType({})
export class Workspace {

    @Field(() => ID, {nullable:false})
    id!: string;

    @Field(() => String, {nullable:true})
    domainName!: string | null;

    @Field(() => String, {nullable:true})
    displayName!: string | null;

    @Field(() => String, {nullable:true})
    logo!: string | null;

    @HideField()
    deletedAt!: Date | null;

    @Field(() => Date, {nullable:false})
    createdAt!: Date;

    @Field(() => Date, {nullable:false})
    updatedAt!: Date;

    @Field(() => [WorkspaceMember], {nullable:true})
    workspaceMember?: Array<WorkspaceMember>;

    @Field(() => [Company], {nullable:true})
    companies?: Array<Company>;

    @Field(() => [Person], {nullable:true})
    people?: Array<Person>;

    @Field(() => [CommentThread], {nullable:true})
    commentThreads?: Array<CommentThread>;

    @Field(() => [Comment], {nullable:true})
    comments?: Array<Comment>;

    @Field(() => [Pipeline], {nullable:true})
    pipelines?: Array<Pipeline>;

    @Field(() => [PipelineStage], {nullable:true})
    pipelineStages?: Array<PipelineStage>;

    @Field(() => [PipelineProgress], {nullable:true})
    pipelineProgresses?: Array<PipelineProgress>;

    @HideField()
    _count?: WorkspaceCount;
}
