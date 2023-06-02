import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineProgressCreateWithoutPipelineStageInput } from './pipeline-progress-create-without-pipeline-stage.input';
import { Type } from 'class-transformer';
import { PipelineProgressCreateOrConnectWithoutPipelineStageInput } from './pipeline-progress-create-or-connect-without-pipeline-stage.input';
import { PipelineProgressUpsertWithWhereUniqueWithoutPipelineStageInput } from './pipeline-progress-upsert-with-where-unique-without-pipeline-stage.input';
import { PipelineProgressCreateManyPipelineStageInputEnvelope } from './pipeline-progress-create-many-pipeline-stage-input-envelope.input';
import { PipelineProgressWhereUniqueInput } from './pipeline-progress-where-unique.input';
import { PipelineProgressUpdateWithWhereUniqueWithoutPipelineStageInput } from './pipeline-progress-update-with-where-unique-without-pipeline-stage.input';
import { PipelineProgressUpdateManyWithWhereWithoutPipelineStageInput } from './pipeline-progress-update-many-with-where-without-pipeline-stage.input';
import { PipelineProgressScalarWhereInput } from './pipeline-progress-scalar-where.input';

@InputType()
export class PipelineProgressUncheckedUpdateManyWithoutPipelineStageNestedInput {
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

  @Field(
    () => [PipelineProgressUpsertWithWhereUniqueWithoutPipelineStageInput],
    { nullable: true },
  )
  @Type(() => PipelineProgressUpsertWithWhereUniqueWithoutPipelineStageInput)
  upsert?: Array<PipelineProgressUpsertWithWhereUniqueWithoutPipelineStageInput>;

  @Field(() => PipelineProgressCreateManyPipelineStageInputEnvelope, {
    nullable: true,
  })
  @Type(() => PipelineProgressCreateManyPipelineStageInputEnvelope)
  createMany?: PipelineProgressCreateManyPipelineStageInputEnvelope;

  @Field(() => [PipelineProgressWhereUniqueInput], { nullable: true })
  @Type(() => PipelineProgressWhereUniqueInput)
  set?: Array<PipelineProgressWhereUniqueInput>;

  @Field(() => [PipelineProgressWhereUniqueInput], { nullable: true })
  @Type(() => PipelineProgressWhereUniqueInput)
  disconnect?: Array<PipelineProgressWhereUniqueInput>;

  @Field(() => [PipelineProgressWhereUniqueInput], { nullable: true })
  @Type(() => PipelineProgressWhereUniqueInput)
  delete?: Array<PipelineProgressWhereUniqueInput>;

  @Field(() => [PipelineProgressWhereUniqueInput], { nullable: true })
  @Type(() => PipelineProgressWhereUniqueInput)
  connect?: Array<PipelineProgressWhereUniqueInput>;

  @Field(
    () => [PipelineProgressUpdateWithWhereUniqueWithoutPipelineStageInput],
    { nullable: true },
  )
  @Type(() => PipelineProgressUpdateWithWhereUniqueWithoutPipelineStageInput)
  update?: Array<PipelineProgressUpdateWithWhereUniqueWithoutPipelineStageInput>;

  @Field(() => [PipelineProgressUpdateManyWithWhereWithoutPipelineStageInput], {
    nullable: true,
  })
  @Type(() => PipelineProgressUpdateManyWithWhereWithoutPipelineStageInput)
  updateMany?: Array<PipelineProgressUpdateManyWithWhereWithoutPipelineStageInput>;

  @Field(() => [PipelineProgressScalarWhereInput], { nullable: true })
  @Type(() => PipelineProgressScalarWhereInput)
  deleteMany?: Array<PipelineProgressScalarWhereInput>;
}
