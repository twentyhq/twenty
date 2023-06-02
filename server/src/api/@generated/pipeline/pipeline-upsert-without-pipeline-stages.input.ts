import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineUpdateWithoutPipelineStagesInput } from './pipeline-update-without-pipeline-stages.input';
import { Type } from 'class-transformer';
import { PipelineCreateWithoutPipelineStagesInput } from './pipeline-create-without-pipeline-stages.input';

@InputType()
export class PipelineUpsertWithoutPipelineStagesInput {
  @Field(() => PipelineUpdateWithoutPipelineStagesInput, { nullable: false })
  @Type(() => PipelineUpdateWithoutPipelineStagesInput)
  update!: PipelineUpdateWithoutPipelineStagesInput;

  @Field(() => PipelineCreateWithoutPipelineStagesInput, { nullable: false })
  @Type(() => PipelineCreateWithoutPipelineStagesInput)
  create!: PipelineCreateWithoutPipelineStagesInput;
}
