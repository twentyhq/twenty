import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineStageWhereUniqueInput } from './pipeline-stage-where-unique.input';
import { Type } from 'class-transformer';
import { PipelineStageCreateWithoutPipelineInput } from './pipeline-stage-create-without-pipeline.input';

@InputType()
export class PipelineStageCreateOrConnectWithoutPipelineInput {
  @Field(() => PipelineStageWhereUniqueInput, { nullable: false })
  @Type(() => PipelineStageWhereUniqueInput)
  where!: PipelineStageWhereUniqueInput;

  @Field(() => PipelineStageCreateWithoutPipelineInput, { nullable: false })
  @Type(() => PipelineStageCreateWithoutPipelineInput)
  create!: PipelineStageCreateWithoutPipelineInput;
}
