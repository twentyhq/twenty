import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineWhereUniqueInput } from './pipeline-where-unique.input';
import { Type } from 'class-transformer';
import { PipelineCreateWithoutPipelineProgressesInput } from './pipeline-create-without-pipeline-progresses.input';

@InputType()
export class PipelineCreateOrConnectWithoutPipelineProgressesInput {
  @Field(() => PipelineWhereUniqueInput, { nullable: false })
  @Type(() => PipelineWhereUniqueInput)
  where!: PipelineWhereUniqueInput;

  @Field(() => PipelineCreateWithoutPipelineProgressesInput, {
    nullable: false,
  })
  @Type(() => PipelineCreateWithoutPipelineProgressesInput)
  create!: PipelineCreateWithoutPipelineProgressesInput;
}
