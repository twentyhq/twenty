import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import * as Validator from 'class-validator';
import { Int } from '@nestjs/graphql';
import { HideField } from '@nestjs/graphql';
import { PipelineStageCountAggregate } from './pipeline-stage-count-aggregate.output';
import { PipelineStageAvgAggregate } from './pipeline-stage-avg-aggregate.output';
import { PipelineStageSumAggregate } from './pipeline-stage-sum-aggregate.output';
import { PipelineStageMinAggregate } from './pipeline-stage-min-aggregate.output';
import { PipelineStageMaxAggregate } from './pipeline-stage-max-aggregate.output';

@ObjectType()
export class PipelineStageGroupBy {

    @Field(() => String, {nullable:false})
    @Validator.IsString()
    @Validator.IsOptional()
    id!: string;

    @Field(() => String, {nullable:false})
    @Validator.IsString()
    name!: string;

    @Field(() => String, {nullable:false})
    @Validator.IsString()
    type!: string;

    @Field(() => String, {nullable:false})
    @Validator.IsString()
    color!: string;

    @Field(() => Int, {nullable:true})
    @Validator.IsNumber()
    @Validator.IsOptional()
    index?: number;

    @Field(() => String, {nullable:false})
    pipelineId!: string;

    @HideField()
    workspaceId!: string;

    @HideField()
    deletedAt?: Date | string;

    @Field(() => Date, {nullable:false})
    createdAt!: Date | string;

    @Field(() => Date, {nullable:false})
    updatedAt!: Date | string;

    @Field(() => PipelineStageCountAggregate, {nullable:true})
    _count?: PipelineStageCountAggregate;

    @Field(() => PipelineStageAvgAggregate, {nullable:true})
    _avg?: PipelineStageAvgAggregate;

    @Field(() => PipelineStageSumAggregate, {nullable:true})
    _sum?: PipelineStageSumAggregate;

    @Field(() => PipelineStageMinAggregate, {nullable:true})
    _min?: PipelineStageMinAggregate;

    @Field(() => PipelineStageMaxAggregate, {nullable:true})
    _max?: PipelineStageMaxAggregate;
}
