import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineProgressCreateWithoutPipelineInput } from './pipeline-progress-create-without-pipeline.input';
import { Type } from 'class-transformer';
import { PipelineProgressCreateOrConnectWithoutPipelineInput } from './pipeline-progress-create-or-connect-without-pipeline.input';
import { PipelineProgressCreateManyPipelineInputEnvelope } from './pipeline-progress-create-many-pipeline-input-envelope.input';
import { PipelineProgressWhereUniqueInput } from './pipeline-progress-where-unique.input';

@InputType()
export class PipelineProgressUncheckedCreateNestedManyWithoutPipelineInput {
  @Field(() => [PipelineProgressCreateWithoutPipelineInput], { nullable: true })
  @Type(() => PipelineProgressCreateWithoutPipelineInput)
  create?: Array<PipelineProgressCreateWithoutPipelineInput>;

  @Field(() => [PipelineProgressCreateOrConnectWithoutPipelineInput], {
    nullable: true,
  })
  @Type(() => PipelineProgressCreateOrConnectWithoutPipelineInput)
  connectOrCreate?: Array<PipelineProgressCreateOrConnectWithoutPipelineInput>;

  @Field(() => PipelineProgressCreateManyPipelineInputEnvelope, {
    nullable: true,
  })
  @Type(() => PipelineProgressCreateManyPipelineInputEnvelope)
  createMany?: PipelineProgressCreateManyPipelineInputEnvelope;

  @Field(() => [PipelineProgressWhereUniqueInput], { nullable: true })
  @Type(() => PipelineProgressWhereUniqueInput)
  connect?: Array<PipelineProgressWhereUniqueInput>;
}
