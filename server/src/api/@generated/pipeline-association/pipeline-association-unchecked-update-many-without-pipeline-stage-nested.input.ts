import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineAssociationCreateWithoutPipelineStageInput } from './pipeline-association-create-without-pipeline-stage.input';
import { Type } from 'class-transformer';
import { PipelineAssociationCreateOrConnectWithoutPipelineStageInput } from './pipeline-association-create-or-connect-without-pipeline-stage.input';
import { PipelineAssociationUpsertWithWhereUniqueWithoutPipelineStageInput } from './pipeline-association-upsert-with-where-unique-without-pipeline-stage.input';
import { PipelineAssociationCreateManyPipelineStageInputEnvelope } from './pipeline-association-create-many-pipeline-stage-input-envelope.input';
import { PipelineAssociationWhereUniqueInput } from './pipeline-association-where-unique.input';
import { PipelineAssociationUpdateWithWhereUniqueWithoutPipelineStageInput } from './pipeline-association-update-with-where-unique-without-pipeline-stage.input';
import { PipelineAssociationUpdateManyWithWhereWithoutPipelineStageInput } from './pipeline-association-update-many-with-where-without-pipeline-stage.input';
import { PipelineAssociationScalarWhereInput } from './pipeline-association-scalar-where.input';

@InputType()
export class PipelineAssociationUncheckedUpdateManyWithoutPipelineStageNestedInput {
  @Field(() => [PipelineAssociationCreateWithoutPipelineStageInput], {
    nullable: true,
  })
  @Type(() => PipelineAssociationCreateWithoutPipelineStageInput)
  create?: Array<PipelineAssociationCreateWithoutPipelineStageInput>;

  @Field(() => [PipelineAssociationCreateOrConnectWithoutPipelineStageInput], {
    nullable: true,
  })
  @Type(() => PipelineAssociationCreateOrConnectWithoutPipelineStageInput)
  connectOrCreate?: Array<PipelineAssociationCreateOrConnectWithoutPipelineStageInput>;

  @Field(
    () => [PipelineAssociationUpsertWithWhereUniqueWithoutPipelineStageInput],
    { nullable: true },
  )
  @Type(() => PipelineAssociationUpsertWithWhereUniqueWithoutPipelineStageInput)
  upsert?: Array<PipelineAssociationUpsertWithWhereUniqueWithoutPipelineStageInput>;

  @Field(() => PipelineAssociationCreateManyPipelineStageInputEnvelope, {
    nullable: true,
  })
  @Type(() => PipelineAssociationCreateManyPipelineStageInputEnvelope)
  createMany?: PipelineAssociationCreateManyPipelineStageInputEnvelope;

  @Field(() => [PipelineAssociationWhereUniqueInput], { nullable: true })
  @Type(() => PipelineAssociationWhereUniqueInput)
  set?: Array<PipelineAssociationWhereUniqueInput>;

  @Field(() => [PipelineAssociationWhereUniqueInput], { nullable: true })
  @Type(() => PipelineAssociationWhereUniqueInput)
  disconnect?: Array<PipelineAssociationWhereUniqueInput>;

  @Field(() => [PipelineAssociationWhereUniqueInput], { nullable: true })
  @Type(() => PipelineAssociationWhereUniqueInput)
  delete?: Array<PipelineAssociationWhereUniqueInput>;

  @Field(() => [PipelineAssociationWhereUniqueInput], { nullable: true })
  @Type(() => PipelineAssociationWhereUniqueInput)
  connect?: Array<PipelineAssociationWhereUniqueInput>;

  @Field(
    () => [PipelineAssociationUpdateWithWhereUniqueWithoutPipelineStageInput],
    { nullable: true },
  )
  @Type(() => PipelineAssociationUpdateWithWhereUniqueWithoutPipelineStageInput)
  update?: Array<PipelineAssociationUpdateWithWhereUniqueWithoutPipelineStageInput>;

  @Field(
    () => [PipelineAssociationUpdateManyWithWhereWithoutPipelineStageInput],
    { nullable: true },
  )
  @Type(() => PipelineAssociationUpdateManyWithWhereWithoutPipelineStageInput)
  updateMany?: Array<PipelineAssociationUpdateManyWithWhereWithoutPipelineStageInput>;

  @Field(() => [PipelineAssociationScalarWhereInput], { nullable: true })
  @Type(() => PipelineAssociationScalarWhereInput)
  deleteMany?: Array<PipelineAssociationScalarWhereInput>;
}
