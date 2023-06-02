import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineProgressWhereUniqueInput } from './pipeline-progress-where-unique.input';
import { Type } from 'class-transformer';
import { PipelineProgressCreateWithoutPipelineInput } from './pipeline-progress-create-without-pipeline.input';

@InputType()
export class PipelineProgressCreateOrConnectWithoutPipelineInput {
  @Field(() => PipelineProgressWhereUniqueInput, { nullable: false })
  @Type(() => PipelineProgressWhereUniqueInput)
  where!: PipelineProgressWhereUniqueInput;

  @Field(() => PipelineProgressCreateWithoutPipelineInput, { nullable: false })
  @Type(() => PipelineProgressCreateWithoutPipelineInput)
  create!: PipelineProgressCreateWithoutPipelineInput;
}
