import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineCreateWithoutPipelineProgressesInput } from './pipeline-create-without-pipeline-progresses.input';
import { Type } from 'class-transformer';
import { PipelineCreateOrConnectWithoutPipelineProgressesInput } from './pipeline-create-or-connect-without-pipeline-progresses.input';
import { PipelineWhereUniqueInput } from './pipeline-where-unique.input';

@InputType()
export class PipelineCreateNestedOneWithoutPipelineProgressesInput {
  @Field(() => PipelineCreateWithoutPipelineProgressesInput, { nullable: true })
  @Type(() => PipelineCreateWithoutPipelineProgressesInput)
  create?: PipelineCreateWithoutPipelineProgressesInput;

  @Field(() => PipelineCreateOrConnectWithoutPipelineProgressesInput, {
    nullable: true,
  })
  @Type(() => PipelineCreateOrConnectWithoutPipelineProgressesInput)
  connectOrCreate?: PipelineCreateOrConnectWithoutPipelineProgressesInput;

  @Field(() => PipelineWhereUniqueInput, { nullable: true })
  @Type(() => PipelineWhereUniqueInput)
  connect?: PipelineWhereUniqueInput;
}
