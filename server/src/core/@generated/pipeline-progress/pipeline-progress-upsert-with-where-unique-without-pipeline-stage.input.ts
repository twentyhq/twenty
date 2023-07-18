import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineProgressWhereUniqueInput } from './pipeline-progress-where-unique.input';
import { Type } from 'class-transformer';
import { PipelineProgressUpdateWithoutPipelineStageInput } from './pipeline-progress-update-without-pipeline-stage.input';
import { HideField } from '@nestjs/graphql';
import { PipelineProgressCreateWithoutPipelineStageInput } from './pipeline-progress-create-without-pipeline-stage.input';

@InputType()
export class PipelineProgressUpsertWithWhereUniqueWithoutPipelineStageInput {

    @Field(() => PipelineProgressWhereUniqueInput, {nullable:false})
    @Type(() => PipelineProgressWhereUniqueInput)
    where!: PipelineProgressWhereUniqueInput;

    @HideField()
    update!: PipelineProgressUpdateWithoutPipelineStageInput;

    @HideField()
    create!: PipelineProgressCreateWithoutPipelineStageInput;
}
