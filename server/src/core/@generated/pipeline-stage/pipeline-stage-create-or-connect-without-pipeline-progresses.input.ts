import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineStageWhereUniqueInput } from './pipeline-stage-where-unique.input';
import { Type } from 'class-transformer';
import { PipelineStageCreateWithoutPipelineProgressesInput } from './pipeline-stage-create-without-pipeline-progresses.input';

@InputType()
export class PipelineStageCreateOrConnectWithoutPipelineProgressesInput {
  @Field(() => PipelineStageWhereUniqueInput, { nullable: false })
  @Type(() => PipelineStageWhereUniqueInput)
  where!: PipelineStageWhereUniqueInput;

  @Field(() => PipelineStageCreateWithoutPipelineProgressesInput, {
    nullable: false,
  })
  @Type(() => PipelineStageCreateWithoutPipelineProgressesInput)
  create!: PipelineStageCreateWithoutPipelineProgressesInput;
}
