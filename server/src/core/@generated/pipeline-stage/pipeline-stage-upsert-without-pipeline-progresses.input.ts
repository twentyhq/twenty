import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineStageUpdateWithoutPipelineProgressesInput } from './pipeline-stage-update-without-pipeline-progresses.input';
import { Type } from 'class-transformer';
import { PipelineStageCreateWithoutPipelineProgressesInput } from './pipeline-stage-create-without-pipeline-progresses.input';

@InputType()
export class PipelineStageUpsertWithoutPipelineProgressesInput {
  @Field(() => PipelineStageUpdateWithoutPipelineProgressesInput, {
    nullable: false,
  })
  @Type(() => PipelineStageUpdateWithoutPipelineProgressesInput)
  update!: PipelineStageUpdateWithoutPipelineProgressesInput;

  @Field(() => PipelineStageCreateWithoutPipelineProgressesInput, {
    nullable: false,
  })
  @Type(() => PipelineStageCreateWithoutPipelineProgressesInput)
  create!: PipelineStageCreateWithoutPipelineProgressesInput;
}
