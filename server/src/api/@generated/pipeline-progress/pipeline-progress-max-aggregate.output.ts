import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { PipelineProgressableType } from '../prisma/pipeline-progressable-type.enum';

@ObjectType()
export class PipelineProgressMaxAggregate {

    @Field(() => String, {nullable:true})
    id?: string;

    @Field(() => Date, {nullable:true})
    createdAt?: Date | string;

    @Field(() => Date, {nullable:true})
    updatedAt?: Date | string;

    @Field(() => Date, {nullable:true})
    deletedAt?: Date | string;

    @Field(() => String, {nullable:true})
    pipelineId?: string;

    @Field(() => String, {nullable:true})
    pipelineStageId?: string;

    @Field(() => PipelineProgressableType, {nullable:true})
    associableType?: keyof typeof PipelineProgressableType;

    @Field(() => String, {nullable:true})
    associableId?: string;
}
