import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineProgressCreateManyPipelineStageInput } from './pipeline-progress-create-many-pipeline-stage.input';
import { Type } from 'class-transformer';

@InputType()
export class PipelineProgressCreateManyPipelineStageInputEnvelope {
  @Field(() => [PipelineProgressCreateManyPipelineStageInput], {
    nullable: false,
  })
  @Type(() => PipelineProgressCreateManyPipelineStageInput)
  data!: Array<PipelineProgressCreateManyPipelineStageInput>;

  @Field(() => Boolean, { nullable: true })
  skipDuplicates?: boolean;
}
