import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineUpdateWithoutPipelineProgressesInput } from './pipeline-update-without-pipeline-progresses.input';
import { Type } from 'class-transformer';
import { PipelineCreateWithoutPipelineProgressesInput } from './pipeline-create-without-pipeline-progresses.input';

@InputType()
export class PipelineUpsertWithoutPipelineProgressesInput {

    @Field(() => PipelineUpdateWithoutPipelineProgressesInput, {nullable:false})
    @Type(() => PipelineUpdateWithoutPipelineProgressesInput)
    update!: PipelineUpdateWithoutPipelineProgressesInput;

    @Field(() => PipelineCreateWithoutPipelineProgressesInput, {nullable:false})
    @Type(() => PipelineCreateWithoutPipelineProgressesInput)
    create!: PipelineCreateWithoutPipelineProgressesInput;
}
