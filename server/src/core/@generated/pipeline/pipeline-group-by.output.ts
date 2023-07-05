import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import * as Validator from 'class-validator';
import { PipelineProgressableType } from '../prisma/pipeline-progressable-type.enum';
import { HideField } from '@nestjs/graphql';
import { PipelineCountAggregate } from './pipeline-count-aggregate.output';
import { PipelineMinAggregate } from './pipeline-min-aggregate.output';
import { PipelineMaxAggregate } from './pipeline-max-aggregate.output';

@ObjectType()
export class PipelineGroupBy {

    @Field(() => String, {nullable:false})
    @Validator.IsString()
    @Validator.IsOptional()
    id!: string;

    @Field(() => String, {nullable:false})
    @Validator.IsString()
    name!: string;

    @Field(() => String, {nullable:false})
    @Validator.IsString()
    icon!: string;

    @Field(() => PipelineProgressableType, {nullable:false})
    pipelineProgressableType!: keyof typeof PipelineProgressableType;

    @HideField()
    workspaceId!: string;

    @HideField()
    deletedAt?: Date | string;

    @Field(() => Date, {nullable:false})
    createdAt!: Date | string;

    @Field(() => Date, {nullable:false})
    updatedAt!: Date | string;

    @Field(() => PipelineCountAggregate, {nullable:true})
    _count?: PipelineCountAggregate;

    @Field(() => PipelineMinAggregate, {nullable:true})
    _min?: PipelineMinAggregate;

    @Field(() => PipelineMaxAggregate, {nullable:true})
    _max?: PipelineMaxAggregate;
}
