import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { HideField } from '@nestjs/graphql';

@InputType()
export class PipelineProgressMinAggregateInput {

    @Field(() => Boolean, {nullable:true})
    id?: true;

    @Field(() => Boolean, {nullable:true})
    amount?: true;

    @Field(() => Boolean, {nullable:true})
    closeDate?: true;

    @Field(() => Boolean, {nullable:true})
    pipelineId?: true;

    @Field(() => Boolean, {nullable:true})
    pipelineStageId?: true;

    @Field(() => Boolean, {nullable:true})
    progressableType?: true;

    @Field(() => Boolean, {nullable:true})
    progressableId?: true;

    @HideField()
    workspaceId?: true;

    @HideField()
    deletedAt?: true;

    @Field(() => Boolean, {nullable:true})
    createdAt?: true;

    @Field(() => Boolean, {nullable:true})
    updatedAt?: true;
}
