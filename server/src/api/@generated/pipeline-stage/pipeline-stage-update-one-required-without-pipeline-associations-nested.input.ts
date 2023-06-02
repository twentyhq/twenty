import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineStageCreateWithoutPipelineAssociationsInput } from './pipeline-stage-create-without-pipeline-associations.input';
import { Type } from 'class-transformer';
import { PipelineStageCreateOrConnectWithoutPipelineAssociationsInput } from './pipeline-stage-create-or-connect-without-pipeline-associations.input';
import { PipelineStageUpsertWithoutPipelineAssociationsInput } from './pipeline-stage-upsert-without-pipeline-associations.input';
import { PipelineStageWhereUniqueInput } from './pipeline-stage-where-unique.input';
import { PipelineStageUpdateWithoutPipelineAssociationsInput } from './pipeline-stage-update-without-pipeline-associations.input';

@InputType()
export class PipelineStageUpdateOneRequiredWithoutPipelineAssociationsNestedInput {
  @Field(() => PipelineStageCreateWithoutPipelineAssociationsInput, {
    nullable: true,
  })
  @Type(() => PipelineStageCreateWithoutPipelineAssociationsInput)
  create?: PipelineStageCreateWithoutPipelineAssociationsInput;

  @Field(() => PipelineStageCreateOrConnectWithoutPipelineAssociationsInput, {
    nullable: true,
  })
  @Type(() => PipelineStageCreateOrConnectWithoutPipelineAssociationsInput)
  connectOrCreate?: PipelineStageCreateOrConnectWithoutPipelineAssociationsInput;

  @Field(() => PipelineStageUpsertWithoutPipelineAssociationsInput, {
    nullable: true,
  })
  @Type(() => PipelineStageUpsertWithoutPipelineAssociationsInput)
  upsert?: PipelineStageUpsertWithoutPipelineAssociationsInput;

  @Field(() => PipelineStageWhereUniqueInput, { nullable: true })
  @Type(() => PipelineStageWhereUniqueInput)
  connect?: PipelineStageWhereUniqueInput;

  @Field(() => PipelineStageUpdateWithoutPipelineAssociationsInput, {
    nullable: true,
  })
  @Type(() => PipelineStageUpdateWithoutPipelineAssociationsInput)
  update?: PipelineStageUpdateWithoutPipelineAssociationsInput;
}
