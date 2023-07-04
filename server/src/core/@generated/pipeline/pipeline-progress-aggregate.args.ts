import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { PipelineProgressWhereInput } from '../pipeline-progress/pipeline-progress-where.input';
import { Type } from 'class-transformer';
import { PipelineProgressOrderByWithRelationInput } from '../pipeline-progress/pipeline-progress-order-by-with-relation.input';
import { PipelineProgressWhereUniqueInput } from '../pipeline-progress/pipeline-progress-where-unique.input';
import { Int } from '@nestjs/graphql';
import { PipelineProgressCountAggregateInput } from '../pipeline-progress/pipeline-progress-count-aggregate.input';
import { PipelineProgressAvgAggregateInput } from '../pipeline-progress/pipeline-progress-avg-aggregate.input';
import { PipelineProgressSumAggregateInput } from '../pipeline-progress/pipeline-progress-sum-aggregate.input';
import { PipelineProgressMinAggregateInput } from '../pipeline-progress/pipeline-progress-min-aggregate.input';
import { PipelineProgressMaxAggregateInput } from '../pipeline-progress/pipeline-progress-max-aggregate.input';

@ArgsType()
export class PipelineProgressAggregateArgs {

    @Field(() => PipelineProgressWhereInput, {nullable:true})
    @Type(() => PipelineProgressWhereInput)
    where?: PipelineProgressWhereInput;

    @Field(() => [PipelineProgressOrderByWithRelationInput], {nullable:true})
    orderBy?: Array<PipelineProgressOrderByWithRelationInput>;

    @Field(() => PipelineProgressWhereUniqueInput, {nullable:true})
    cursor?: PipelineProgressWhereUniqueInput;

    @Field(() => Int, {nullable:true})
    take?: number;

    @Field(() => Int, {nullable:true})
    skip?: number;

    @Field(() => PipelineProgressCountAggregateInput, {nullable:true})
    _count?: PipelineProgressCountAggregateInput;

    @Field(() => PipelineProgressAvgAggregateInput, {nullable:true})
    _avg?: PipelineProgressAvgAggregateInput;

    @Field(() => PipelineProgressSumAggregateInput, {nullable:true})
    _sum?: PipelineProgressSumAggregateInput;

    @Field(() => PipelineProgressMinAggregateInput, {nullable:true})
    _min?: PipelineProgressMinAggregateInput;

    @Field(() => PipelineProgressMaxAggregateInput, {nullable:true})
    _max?: PipelineProgressMaxAggregateInput;
}
