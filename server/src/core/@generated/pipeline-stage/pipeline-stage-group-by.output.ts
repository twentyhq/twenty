import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import * as Validator from 'class-validator';
import { HideField } from '@nestjs/graphql';
import { PipelineStageCountAggregate } from './pipeline-stage-count-aggregate.output';
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

    @Field(() => PipelineStageMinAggregate, {nullable:true})
    _min?: PipelineStageMinAggregate;

    @Field(() => PipelineStageMaxAggregate, {nullable:true})
    _max?: PipelineStageMaxAggregate;
}
