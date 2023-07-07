import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { SortOrder } from '../prisma/sort-order.enum';
import { HideField } from '@nestjs/graphql';
import { WorkspaceMemberOrderByRelationAggregateInput } from '../workspace-member/workspace-member-order-by-relation-aggregate.input';
import { CompanyOrderByRelationAggregateInput } from '../company/company-order-by-relation-aggregate.input';
import { PersonOrderByRelationAggregateInput } from '../person/person-order-by-relation-aggregate.input';
import { CommentThreadOrderByRelationAggregateInput } from '../comment-thread/comment-thread-order-by-relation-aggregate.input';
import { CommentOrderByRelationAggregateInput } from '../comment/comment-order-by-relation-aggregate.input';
import { PipelineOrderByRelationAggregateInput } from '../pipeline/pipeline-order-by-relation-aggregate.input';
import { PipelineStageOrderByRelationAggregateInput } from '../pipeline-stage/pipeline-stage-order-by-relation-aggregate.input';
import { PipelineProgressOrderByRelationAggregateInput } from '../pipeline-progress/pipeline-progress-order-by-relation-aggregate.input';

@InputType()
export class WorkspaceOrderByWithRelationInput {

    @Field(() => SortOrder, {nullable:true})
    id?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    domainName?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    displayName?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    logo?: keyof typeof SortOrder;

    @HideField()
    deletedAt?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    createdAt?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    updatedAt?: keyof typeof SortOrder;

    @Field(() => WorkspaceMemberOrderByRelationAggregateInput, {nullable:true})
    workspaceMember?: WorkspaceMemberOrderByRelationAggregateInput;

    @Field(() => CompanyOrderByRelationAggregateInput, {nullable:true})
    companies?: CompanyOrderByRelationAggregateInput;

    @Field(() => PersonOrderByRelationAggregateInput, {nullable:true})
    people?: PersonOrderByRelationAggregateInput;

    @Field(() => CommentThreadOrderByRelationAggregateInput, {nullable:true})
    commentThreads?: CommentThreadOrderByRelationAggregateInput;

    @Field(() => CommentOrderByRelationAggregateInput, {nullable:true})
    comments?: CommentOrderByRelationAggregateInput;

    @Field(() => PipelineOrderByRelationAggregateInput, {nullable:true})
    pipelines?: PipelineOrderByRelationAggregateInput;

    @Field(() => PipelineStageOrderByRelationAggregateInput, {nullable:true})
    pipelineStages?: PipelineStageOrderByRelationAggregateInput;

    @Field(() => PipelineProgressOrderByRelationAggregateInput, {nullable:true})
    pipelineProgresses?: PipelineProgressOrderByRelationAggregateInput;
}
