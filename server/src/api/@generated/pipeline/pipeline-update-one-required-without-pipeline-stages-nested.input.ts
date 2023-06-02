import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineCreateWithoutPipelineStagesInput } from './pipeline-create-without-pipeline-stages.input';
import { Type } from 'class-transformer';
import { PipelineCreateOrConnectWithoutPipelineStagesInput } from './pipeline-create-or-connect-without-pipeline-stages.input';
import { PipelineUpsertWithoutPipelineStagesInput } from './pipeline-upsert-without-pipeline-stages.input';
import { PipelineWhereUniqueInput } from './pipeline-where-unique.input';
import { PipelineUpdateWithoutPipelineStagesInput } from './pipeline-update-without-pipeline-stages.input';

@InputType()
export class PipelineUpdateOneRequiredWithoutPipelineStagesNestedInput {
  @Field(() => PipelineCreateWithoutPipelineStagesInput, { nullable: true })
  @Type(() => PipelineCreateWithoutPipelineStagesInput)
  create?: PipelineCreateWithoutPipelineStagesInput;

  @Field(() => PipelineCreateOrConnectWithoutPipelineStagesInput, {
    nullable: true,
  })
  @Type(() => PipelineCreateOrConnectWithoutPipelineStagesInput)
  connectOrCreate?: PipelineCreateOrConnectWithoutPipelineStagesInput;

  @Field(() => PipelineUpsertWithoutPipelineStagesInput, { nullable: true })
  @Type(() => PipelineUpsertWithoutPipelineStagesInput)
  upsert?: PipelineUpsertWithoutPipelineStagesInput;

  @Field(() => PipelineWhereUniqueInput, { nullable: true })
  @Type(() => PipelineWhereUniqueInput)
  connect?: PipelineWhereUniqueInput;

  @Field(() => PipelineUpdateWithoutPipelineStagesInput, { nullable: true })
  @Type(() => PipelineUpdateWithoutPipelineStagesInput)
  update?: PipelineUpdateWithoutPipelineStagesInput;
}
