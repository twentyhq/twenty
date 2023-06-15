import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineProgressCreateWithoutPipelineStageInput } from './pipeline-progress-create-without-pipeline-stage.input';
import { Type } from 'class-transformer';
import { PipelineProgressCreateOrConnectWithoutPipelineStageInput } from './pipeline-progress-create-or-connect-without-pipeline-stage.input';
import { PipelineProgressCreateManyPipelineStageInputEnvelope } from './pipeline-progress-create-many-pipeline-stage-input-envelope.input';
import { PipelineProgressWhereUniqueInput } from './pipeline-progress-where-unique.input';

@InputType()
export class PipelineProgressCreateNestedManyWithoutPipelineStageInput {
  @Field(() => [PipelineProgressCreateWithoutPipelineStageInput], {
    nullable: true,
  })
  @Type(() => PipelineProgressCreateWithoutPipelineStageInput)
  create?: Array<PipelineProgressCreateWithoutPipelineStageInput>;

  @Field(() => [PipelineProgressCreateOrConnectWithoutPipelineStageInput], {
    nullable: true,
  })
  @Type(() => PipelineProgressCreateOrConnectWithoutPipelineStageInput)
  connectOrCreate?: Array<PipelineProgressCreateOrConnectWithoutPipelineStageInput>;

  @Field(() => PipelineProgressCreateManyPipelineStageInputEnvelope, {
    nullable: true,
  })
  @Type(() => PipelineProgressCreateManyPipelineStageInputEnvelope)
  createMany?: PipelineProgressCreateManyPipelineStageInputEnvelope;

  @Field(() => [PipelineProgressWhereUniqueInput], { nullable: true })
  @Type(() => PipelineProgressWhereUniqueInput)
  connect?: Array<PipelineProgressWhereUniqueInput>;
}
