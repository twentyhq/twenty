import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineCreateWithoutPipelineProgressesInput } from './pipeline-create-without-pipeline-progresses.input';
import { HideField } from '@nestjs/graphql';
import { PipelineCreateOrConnectWithoutPipelineProgressesInput } from './pipeline-create-or-connect-without-pipeline-progresses.input';
import { PipelineUpsertWithoutPipelineProgressesInput } from './pipeline-upsert-without-pipeline-progresses.input';
import { PipelineWhereUniqueInput } from './pipeline-where-unique.input';
import { Type } from 'class-transformer';
import { PipelineUpdateWithoutPipelineProgressesInput } from './pipeline-update-without-pipeline-progresses.input';

@InputType()
export class PipelineUpdateOneRequiredWithoutPipelineProgressesNestedInput {
  @HideField()
  create?: PipelineCreateWithoutPipelineProgressesInput;

  @HideField()
  connectOrCreate?: PipelineCreateOrConnectWithoutPipelineProgressesInput;

  @HideField()
  upsert?: PipelineUpsertWithoutPipelineProgressesInput;

  @Field(() => PipelineWhereUniqueInput, { nullable: true })
  @Type(() => PipelineWhereUniqueInput)
  connect?: PipelineWhereUniqueInput;

  @HideField()
  update?: PipelineUpdateWithoutPipelineProgressesInput;
}
