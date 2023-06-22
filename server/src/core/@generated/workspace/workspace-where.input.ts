import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringFilter } from '../prisma/string-filter.input';
import { DateTimeFilter } from '../prisma/date-time-filter.input';
import { DateTimeNullableFilter } from '../prisma/date-time-nullable-filter.input';
import { StringNullableFilter } from '../prisma/string-nullable-filter.input';
import { WorkspaceMemberListRelationFilter } from '../workspace-member/workspace-member-list-relation-filter.input';
import { CompanyListRelationFilter } from '../company/company-list-relation-filter.input';
import { PersonListRelationFilter } from '../person/person-list-relation-filter.input';
import { CommentThreadListRelationFilter } from '../comment-thread/comment-thread-list-relation-filter.input';
import { CommentListRelationFilter } from '../comment/comment-list-relation-filter.input';
import { PipelineListRelationFilter } from '../pipeline/pipeline-list-relation-filter.input';
import { PipelineStageListRelationFilter } from '../pipeline-stage/pipeline-stage-list-relation-filter.input';
import { PipelineProgressListRelationFilter } from '../pipeline-progress/pipeline-progress-list-relation-filter.input';

@InputType()
export class WorkspaceWhereInput {

    @Field(() => [WorkspaceWhereInput], {nullable:true})
    AND?: Array<WorkspaceWhereInput>;

    @Field(() => [WorkspaceWhereInput], {nullable:true})
    OR?: Array<WorkspaceWhereInput>;

    @Field(() => [WorkspaceWhereInput], {nullable:true})
    NOT?: Array<WorkspaceWhereInput>;

    @Field(() => StringFilter, {nullable:true})
    id?: StringFilter;

    @Field(() => DateTimeFilter, {nullable:true})
    createdAt?: DateTimeFilter;

    @Field(() => DateTimeFilter, {nullable:true})
    updatedAt?: DateTimeFilter;

    @Field(() => DateTimeNullableFilter, {nullable:true})
    deletedAt?: DateTimeNullableFilter;

    @Field(() => StringFilter, {nullable:true})
    domainName?: StringFilter;

    @Field(() => StringFilter, {nullable:true})
    displayName?: StringFilter;

    @Field(() => StringNullableFilter, {nullable:true})
    logo?: StringNullableFilter;

    @Field(() => WorkspaceMemberListRelationFilter, {nullable:true})
    workspaceMember?: WorkspaceMemberListRelationFilter;

    @Field(() => CompanyListRelationFilter, {nullable:true})
    companies?: CompanyListRelationFilter;

    @Field(() => PersonListRelationFilter, {nullable:true})
    people?: PersonListRelationFilter;

    @Field(() => CommentThreadListRelationFilter, {nullable:true})
    commentThreads?: CommentThreadListRelationFilter;

    @Field(() => CommentListRelationFilter, {nullable:true})
    comments?: CommentListRelationFilter;

    @Field(() => PipelineListRelationFilter, {nullable:true})
    pipelines?: PipelineListRelationFilter;

    @Field(() => PipelineStageListRelationFilter, {nullable:true})
    pipelineStages?: PipelineStageListRelationFilter;

    @Field(() => PipelineProgressListRelationFilter, {nullable:true})
    pipelineProgresses?: PipelineProgressListRelationFilter;
}
