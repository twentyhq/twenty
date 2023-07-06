import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import * as Validator from 'class-validator';
import { Int } from '@nestjs/graphql';
import { PipelineProgressableType } from '../prisma/pipeline-progressable-type.enum';
import { HideField } from '@nestjs/graphql';
import { PipelineProgressCountAggregate } from './pipeline-progress-count-aggregate.output';
import { PipelineProgressAvgAggregate } from './pipeline-progress-avg-aggregate.output';
import { PipelineProgressSumAggregate } from './pipeline-progress-sum-aggregate.output';
import { PipelineProgressMinAggregate } from './pipeline-progress-min-aggregate.output';
import { PipelineProgressMaxAggregate } from './pipeline-progress-max-aggregate.output';

@ObjectType()
export class PipelineProgressGroupBy {

    @Field(() => String, {nullable:false})
    @Validator.IsString()
    @Validator.IsOptional()
    id!: string;

    @Field(() => Int, {nullable:true})
    amount?: number;

    @Field(() => Date, {nullable:true})
    closeDate?: Date | string;

    @Field(() => String, {nullable:true})
    probability?: string;

    @Field(() => String, {nullable:true})
    recurring?: string;

    @Field(() => String, {nullable:false})
    pipelineId!: string;

    @Field(() => String, {nullable:false})
    pipelineStageId!: string;

    @Field(() => PipelineProgressableType, {nullable:false})
    progressableType!: keyof typeof PipelineProgressableType;

    @Field(() => String, {nullable:false})
    progressableId!: string;

    @HideField()
    workspaceId!: string;

    @HideField()
    deletedAt?: Date | string;

    @Field(() => Date, {nullable:false})
    createdAt!: Date | string;

    @Field(() => Date, {nullable:false})
    updatedAt!: Date | string;

    @Field(() => PipelineProgressCountAggregate, {nullable:true})
    _count?: PipelineProgressCountAggregate;

    @Field(() => PipelineProgressAvgAggregate, {nullable:true})
    _avg?: PipelineProgressAvgAggregate;

    @Field(() => PipelineProgressSumAggregate, {nullable:true})
    _sum?: PipelineProgressSumAggregate;

    @Field(() => PipelineProgressMinAggregate, {nullable:true})
    _min?: PipelineProgressMinAggregate;

    @Field(() => PipelineProgressMaxAggregate, {nullable:true})
    _max?: PipelineProgressMaxAggregate;
}
