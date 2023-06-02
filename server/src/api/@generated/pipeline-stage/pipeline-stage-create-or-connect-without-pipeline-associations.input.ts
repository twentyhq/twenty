import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineStageWhereUniqueInput } from './pipeline-stage-where-unique.input';
import { Type } from 'class-transformer';
import { PipelineStageCreateWithoutPipelineAssociationsInput } from './pipeline-stage-create-without-pipeline-associations.input';

@InputType()
export class PipelineStageCreateOrConnectWithoutPipelineAssociationsInput {
  @Field(() => PipelineStageWhereUniqueInput, { nullable: false })
  @Type(() => PipelineStageWhereUniqueInput)
  where!: PipelineStageWhereUniqueInput;

  @Field(() => PipelineStageCreateWithoutPipelineAssociationsInput, {
    nullable: false,
  })
  @Type(() => PipelineStageCreateWithoutPipelineAssociationsInput)
  create!: PipelineStageCreateWithoutPipelineAssociationsInput;
}
