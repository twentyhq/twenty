import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineStageCreateWithoutPipelineAssociationsInput } from './pipeline-stage-create-without-pipeline-associations.input';
import { Type } from 'class-transformer';
import { PipelineStageCreateOrConnectWithoutPipelineAssociationsInput } from './pipeline-stage-create-or-connect-without-pipeline-associations.input';
import { PipelineStageWhereUniqueInput } from './pipeline-stage-where-unique.input';

@InputType()
export class PipelineStageCreateNestedOneWithoutPipelineAssociationsInput {
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

  @Field(() => PipelineStageWhereUniqueInput, { nullable: true })
  @Type(() => PipelineStageWhereUniqueInput)
  connect?: PipelineStageWhereUniqueInput;
}
