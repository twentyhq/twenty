import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { Int } from '@nestjs/graphql';
import { HideField } from '@nestjs/graphql';

@ObjectType()
export class PipelineProgressCountAggregate {

    @Field(() => Int, {nullable:false})
    id!: number;

    @Field(() => Int, {nullable:false})
    amount!: number;

    @Field(() => Int, {nullable:false})
    closeDate!: number;

    @Field(() => Int, {nullable:false})
    pipelineId!: number;

    @Field(() => Int, {nullable:false})
    pipelineStageId!: number;

    @Field(() => Int, {nullable:false})
    progressableType!: number;

    @Field(() => Int, {nullable:false})
    progressableId!: number;

    @HideField()
    workspaceId!: number;

    @HideField()
    deletedAt!: number;

    @Field(() => Int, {nullable:false})
    createdAt!: number;

    @Field(() => Int, {nullable:false})
    updatedAt!: number;

    @Field(() => Int, {nullable:false})
    _all!: number;
}
