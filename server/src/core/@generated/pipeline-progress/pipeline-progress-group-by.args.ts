import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { PipelineProgressWhereInput } from './pipeline-progress-where.input';
import { Type } from 'class-transformer';
import { PipelineProgressOrderByWithAggregationInput } from './pipeline-progress-order-by-with-aggregation.input';
import { PipelineProgressScalarFieldEnum } from './pipeline-progress-scalar-field.enum';
import { PipelineProgressScalarWhereWithAggregatesInput } from './pipeline-progress-scalar-where-with-aggregates.input';
import { Int } from '@nestjs/graphql';
import { PipelineProgressCountAggregateInput } from './pipeline-progress-count-aggregate.input';
import { PipelineProgressMinAggregateInput } from './pipeline-progress-min-aggregate.input';
import { PipelineProgressMaxAggregateInput } from './pipeline-progress-max-aggregate.input';

@ArgsType()
export class PipelineProgressGroupByArgs {

    @Field(() => PipelineProgressWhereInput, {nullable:true})
    @Type(() => PipelineProgressWhereInput)
    where?: PipelineProgressWhereInput;

    @Field(() => [PipelineProgressOrderByWithAggregationInput], {nullable:true})
    orderBy?: Array<PipelineProgressOrderByWithAggregationInput>;

    @Field(() => [PipelineProgressScalarFieldEnum], {nullable:false})
    by!: Array<keyof typeof PipelineProgressScalarFieldEnum>;

    @Field(() => PipelineProgressScalarWhereWithAggregatesInput, {nullable:true})
    having?: PipelineProgressScalarWhereWithAggregatesInput;

    @Field(() => Int, {nullable:true})
    take?: number;

    @Field(() => Int, {nullable:true})
    skip?: number;

    @Field(() => PipelineProgressCountAggregateInput, {nullable:true})
    _count?: PipelineProgressCountAggregateInput;

    @Field(() => PipelineProgressMinAggregateInput, {nullable:true})
    _min?: PipelineProgressMinAggregateInput;

    @Field(() => PipelineProgressMaxAggregateInput, {nullable:true})
    _max?: PipelineProgressMaxAggregateInput;
}
