import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineWhereUniqueInput } from './pipeline-where-unique.input';
import { Type } from 'class-transformer';
import { PipelineCreateWithoutPipelineStagesInput } from './pipeline-create-without-pipeline-stages.input';
import { HideField } from '@nestjs/graphql';

@InputType()
export class PipelineCreateOrConnectWithoutPipelineStagesInput {

    @Field(() => PipelineWhereUniqueInput, {nullable:false})
    @Type(() => PipelineWhereUniqueInput)
    where!: PipelineWhereUniqueInput;

    @HideField()
    create!: PipelineCreateWithoutPipelineStagesInput;
}
