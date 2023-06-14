import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { PipelineProgressableType } from '../prisma/pipeline-progressable-type.enum';
import { PipelineProgressCountAggregate } from './pipeline-progress-count-aggregate.output';
import { PipelineProgressMinAggregate } from './pipeline-progress-min-aggregate.output';
import { PipelineProgressMaxAggregate } from './pipeline-progress-max-aggregate.output';

@ObjectType()
export class PipelineProgressGroupBy {

    @Field(() => String, {nullable:false})
    id!: string;

    @Field(() => Date, {nullable:false})
    createdAt!: Date | string;

    @Field(() => Date, {nullable:false})
    updatedAt!: Date | string;

    @Field(() => Date, {nullable:true})
    deletedAt?: Date | string;

    @Field(() => String, {nullable:false})
    pipelineId!: string;

    @Field(() => String, {nullable:false})
    pipelineStageId!: string;

    @Field(() => PipelineProgressableType, {nullable:false})
    associableType!: keyof typeof PipelineProgressableType;

    @Field(() => String, {nullable:false})
    associableId!: string;

    @Field(() => PipelineProgressCountAggregate, {nullable:true})
    _count?: PipelineProgressCountAggregate;

    @Field(() => PipelineProgressMinAggregate, {nullable:true})
    _min?: PipelineProgressMinAggregate;

    @Field(() => PipelineProgressMaxAggregate, {nullable:true})
    _max?: PipelineProgressMaxAggregate;
}
