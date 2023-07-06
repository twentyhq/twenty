import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { SortOrder } from '../prisma/sort-order.enum';
import { SortOrderInput } from '../prisma/sort-order.input';
import { HideField } from '@nestjs/graphql';
import { PipelineOrderByWithRelationInput } from '../pipeline/pipeline-order-by-with-relation.input';
import { PipelineStageOrderByWithRelationInput } from '../pipeline-stage/pipeline-stage-order-by-with-relation.input';
import { WorkspaceOrderByWithRelationInput } from '../workspace/workspace-order-by-with-relation.input';

@InputType()
export class PipelineProgressOrderByWithRelationInput {

    @Field(() => SortOrder, {nullable:true})
    id?: keyof typeof SortOrder;

    @Field(() => SortOrderInput, {nullable:true})
    amount?: SortOrderInput;

    @Field(() => SortOrderInput, {nullable:true})
    closeDate?: SortOrderInput;

    @Field(() => SortOrderInput, {nullable:true})
    probability?: SortOrderInput;

    @Field(() => SortOrderInput, {nullable:true})
    recurring?: SortOrderInput;

    @Field(() => SortOrder, {nullable:true})
    pipelineId?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    pipelineStageId?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    progressableType?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    progressableId?: keyof typeof SortOrder;

    @HideField()
    workspaceId?: keyof typeof SortOrder;

    @HideField()
    deletedAt?: SortOrderInput;

    @Field(() => SortOrder, {nullable:true})
    createdAt?: keyof typeof SortOrder;

    @Field(() => SortOrder, {nullable:true})
    updatedAt?: keyof typeof SortOrder;

    @Field(() => PipelineOrderByWithRelationInput, {nullable:true})
    pipeline?: PipelineOrderByWithRelationInput;

    @Field(() => PipelineStageOrderByWithRelationInput, {nullable:true})
    pipelineStage?: PipelineStageOrderByWithRelationInput;

    @HideField()
    workspace?: WorkspaceOrderByWithRelationInput;
}
