import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineAssociationCreateWithoutPipelineStageInput } from './pipeline-association-create-without-pipeline-stage.input';
import { Type } from 'class-transformer';
import { PipelineAssociationCreateOrConnectWithoutPipelineStageInput } from './pipeline-association-create-or-connect-without-pipeline-stage.input';
import { PipelineAssociationCreateManyPipelineStageInputEnvelope } from './pipeline-association-create-many-pipeline-stage-input-envelope.input';
import { PipelineAssociationWhereUniqueInput } from './pipeline-association-where-unique.input';

@InputType()
export class PipelineAssociationUncheckedCreateNestedManyWithoutPipelineStageInput {
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

  @Field(() => PipelineAssociationCreateManyPipelineStageInputEnvelope, {
    nullable: true,
  })
  @Type(() => PipelineAssociationCreateManyPipelineStageInputEnvelope)
  createMany?: PipelineAssociationCreateManyPipelineStageInputEnvelope;

  @Field(() => [PipelineAssociationWhereUniqueInput], { nullable: true })
  @Type(() => PipelineAssociationWhereUniqueInput)
  connect?: Array<PipelineAssociationWhereUniqueInput>;
}
