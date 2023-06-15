import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineStageCreateManyPipelineInput } from './pipeline-stage-create-many-pipeline.input';
import { Type } from 'class-transformer';

@InputType()
export class PipelineStageCreateManyPipelineInputEnvelope {
  @Field(() => [PipelineStageCreateManyPipelineInput], { nullable: false })
  @Type(() => PipelineStageCreateManyPipelineInput)
  data!: Array<PipelineStageCreateManyPipelineInput>;

  @Field(() => Boolean, { nullable: true })
  skipDuplicates?: boolean;
}
