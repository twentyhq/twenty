import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineAssociationCreateWithoutPipelineInput } from './pipeline-association-create-without-pipeline.input';
import { Type } from 'class-transformer';
import { PipelineAssociationCreateOrConnectWithoutPipelineInput } from './pipeline-association-create-or-connect-without-pipeline.input';
import { PipelineAssociationUpsertWithWhereUniqueWithoutPipelineInput } from './pipeline-association-upsert-with-where-unique-without-pipeline.input';
import { PipelineAssociationCreateManyPipelineInputEnvelope } from './pipeline-association-create-many-pipeline-input-envelope.input';
import { PipelineAssociationWhereUniqueInput } from './pipeline-association-where-unique.input';
import { PipelineAssociationUpdateWithWhereUniqueWithoutPipelineInput } from './pipeline-association-update-with-where-unique-without-pipeline.input';
import { PipelineAssociationUpdateManyWithWhereWithoutPipelineInput } from './pipeline-association-update-many-with-where-without-pipeline.input';
import { PipelineAssociationScalarWhereInput } from './pipeline-association-scalar-where.input';

@InputType()
export class PipelineAssociationUpdateManyWithoutPipelineNestedInput {
  @Field(() => [PipelineAssociationCreateWithoutPipelineInput], {
    nullable: true,
  })
  @Type(() => PipelineAssociationCreateWithoutPipelineInput)
  create?: Array<PipelineAssociationCreateWithoutPipelineInput>;

  @Field(() => [PipelineAssociationCreateOrConnectWithoutPipelineInput], {
    nullable: true,
  })
  @Type(() => PipelineAssociationCreateOrConnectWithoutPipelineInput)
  connectOrCreate?: Array<PipelineAssociationCreateOrConnectWithoutPipelineInput>;

  @Field(() => [PipelineAssociationUpsertWithWhereUniqueWithoutPipelineInput], {
    nullable: true,
  })
  @Type(() => PipelineAssociationUpsertWithWhereUniqueWithoutPipelineInput)
  upsert?: Array<PipelineAssociationUpsertWithWhereUniqueWithoutPipelineInput>;

  @Field(() => PipelineAssociationCreateManyPipelineInputEnvelope, {
    nullable: true,
  })
  @Type(() => PipelineAssociationCreateManyPipelineInputEnvelope)
  createMany?: PipelineAssociationCreateManyPipelineInputEnvelope;

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

  @Field(() => [PipelineAssociationUpdateWithWhereUniqueWithoutPipelineInput], {
    nullable: true,
  })
  @Type(() => PipelineAssociationUpdateWithWhereUniqueWithoutPipelineInput)
  update?: Array<PipelineAssociationUpdateWithWhereUniqueWithoutPipelineInput>;

  @Field(() => [PipelineAssociationUpdateManyWithWhereWithoutPipelineInput], {
    nullable: true,
  })
  @Type(() => PipelineAssociationUpdateManyWithWhereWithoutPipelineInput)
  updateMany?: Array<PipelineAssociationUpdateManyWithWhereWithoutPipelineInput>;

  @Field(() => [PipelineAssociationScalarWhereInput], { nullable: true })
  @Type(() => PipelineAssociationScalarWhereInput)
  deleteMany?: Array<PipelineAssociationScalarWhereInput>;
}
