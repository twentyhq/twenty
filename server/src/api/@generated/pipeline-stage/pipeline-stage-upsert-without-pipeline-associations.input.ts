import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineStageUpdateWithoutPipelineAssociationsInput } from './pipeline-stage-update-without-pipeline-associations.input';
import { Type } from 'class-transformer';
import { PipelineStageCreateWithoutPipelineAssociationsInput } from './pipeline-stage-create-without-pipeline-associations.input';

@InputType()
export class PipelineStageUpsertWithoutPipelineAssociationsInput {
  @Field(() => PipelineStageUpdateWithoutPipelineAssociationsInput, {
    nullable: false,
  })
  @Type(() => PipelineStageUpdateWithoutPipelineAssociationsInput)
  update!: PipelineStageUpdateWithoutPipelineAssociationsInput;

  @Field(() => PipelineStageCreateWithoutPipelineAssociationsInput, {
    nullable: false,
  })
  @Type(() => PipelineStageCreateWithoutPipelineAssociationsInput)
  create!: PipelineStageCreateWithoutPipelineAssociationsInput;
}
