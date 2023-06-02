import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineStageCreateWithoutPipelineInput } from './pipeline-stage-create-without-pipeline.input';
import { Type } from 'class-transformer';
import { PipelineStageCreateOrConnectWithoutPipelineInput } from './pipeline-stage-create-or-connect-without-pipeline.input';
import { PipelineStageUpsertWithWhereUniqueWithoutPipelineInput } from './pipeline-stage-upsert-with-where-unique-without-pipeline.input';
import { PipelineStageCreateManyPipelineInputEnvelope } from './pipeline-stage-create-many-pipeline-input-envelope.input';
import { PipelineStageWhereUniqueInput } from './pipeline-stage-where-unique.input';
import { PipelineStageUpdateWithWhereUniqueWithoutPipelineInput } from './pipeline-stage-update-with-where-unique-without-pipeline.input';
import { PipelineStageUpdateManyWithWhereWithoutPipelineInput } from './pipeline-stage-update-many-with-where-without-pipeline.input';
import { PipelineStageScalarWhereInput } from './pipeline-stage-scalar-where.input';

@InputType()
export class PipelineStageUncheckedUpdateManyWithoutPipelineNestedInput {
  @Field(() => [PipelineStageCreateWithoutPipelineInput], { nullable: true })
  @Type(() => PipelineStageCreateWithoutPipelineInput)
  create?: Array<PipelineStageCreateWithoutPipelineInput>;

  @Field(() => [PipelineStageCreateOrConnectWithoutPipelineInput], {
    nullable: true,
  })
  @Type(() => PipelineStageCreateOrConnectWithoutPipelineInput)
  connectOrCreate?: Array<PipelineStageCreateOrConnectWithoutPipelineInput>;

  @Field(() => [PipelineStageUpsertWithWhereUniqueWithoutPipelineInput], {
    nullable: true,
  })
  @Type(() => PipelineStageUpsertWithWhereUniqueWithoutPipelineInput)
  upsert?: Array<PipelineStageUpsertWithWhereUniqueWithoutPipelineInput>;

  @Field(() => PipelineStageCreateManyPipelineInputEnvelope, { nullable: true })
  @Type(() => PipelineStageCreateManyPipelineInputEnvelope)
  createMany?: PipelineStageCreateManyPipelineInputEnvelope;

  @Field(() => [PipelineStageWhereUniqueInput], { nullable: true })
  @Type(() => PipelineStageWhereUniqueInput)
  set?: Array<PipelineStageWhereUniqueInput>;

  @Field(() => [PipelineStageWhereUniqueInput], { nullable: true })
  @Type(() => PipelineStageWhereUniqueInput)
  disconnect?: Array<PipelineStageWhereUniqueInput>;

  @Field(() => [PipelineStageWhereUniqueInput], { nullable: true })
  @Type(() => PipelineStageWhereUniqueInput)
  delete?: Array<PipelineStageWhereUniqueInput>;

  @Field(() => [PipelineStageWhereUniqueInput], { nullable: true })
  @Type(() => PipelineStageWhereUniqueInput)
  connect?: Array<PipelineStageWhereUniqueInput>;

  @Field(() => [PipelineStageUpdateWithWhereUniqueWithoutPipelineInput], {
    nullable: true,
  })
  @Type(() => PipelineStageUpdateWithWhereUniqueWithoutPipelineInput)
  update?: Array<PipelineStageUpdateWithWhereUniqueWithoutPipelineInput>;

  @Field(() => [PipelineStageUpdateManyWithWhereWithoutPipelineInput], {
    nullable: true,
  })
  @Type(() => PipelineStageUpdateManyWithWhereWithoutPipelineInput)
  updateMany?: Array<PipelineStageUpdateManyWithWhereWithoutPipelineInput>;

  @Field(() => [PipelineStageScalarWhereInput], { nullable: true })
  @Type(() => PipelineStageScalarWhereInput)
  deleteMany?: Array<PipelineStageScalarWhereInput>;
}
