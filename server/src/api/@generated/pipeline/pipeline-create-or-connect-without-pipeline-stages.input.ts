import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineWhereUniqueInput } from './pipeline-where-unique.input';
import { Type } from 'class-transformer';
import { PipelineCreateWithoutPipelineStagesInput } from './pipeline-create-without-pipeline-stages.input';

@InputType()
export class PipelineCreateOrConnectWithoutPipelineStagesInput {

    @Field(() => PipelineWhereUniqueInput, {nullable:false})
    @Type(() => PipelineWhereUniqueInput)
    where!: PipelineWhereUniqueInput;

    @Field(() => PipelineCreateWithoutPipelineStagesInput, {nullable:false})
    @Type(() => PipelineCreateWithoutPipelineStagesInput)
    create!: PipelineCreateWithoutPipelineStagesInput;
}
