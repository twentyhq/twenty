import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineProgressWhereUniqueInput } from './pipeline-progress-where-unique.input';
import { Type } from 'class-transformer';
import { PipelineProgressUpdateWithoutPipelineInput } from './pipeline-progress-update-without-pipeline.input';
import { HideField } from '@nestjs/graphql';
import { PipelineProgressCreateWithoutPipelineInput } from './pipeline-progress-create-without-pipeline.input';

@InputType()
export class PipelineProgressUpsertWithWhereUniqueWithoutPipelineInput {

    @Field(() => PipelineProgressWhereUniqueInput, {nullable:false})
    @Type(() => PipelineProgressWhereUniqueInput)
    where!: PipelineProgressWhereUniqueInput;

    @HideField()
    update!: PipelineProgressUpdateWithoutPipelineInput;

    @HideField()
    create!: PipelineProgressCreateWithoutPipelineInput;
}
