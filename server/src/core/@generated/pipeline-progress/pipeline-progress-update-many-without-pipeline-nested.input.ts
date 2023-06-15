import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineProgressCreateWithoutPipelineInput } from './pipeline-progress-create-without-pipeline.input';
import { Type } from 'class-transformer';
import { PipelineProgressCreateOrConnectWithoutPipelineInput } from './pipeline-progress-create-or-connect-without-pipeline.input';
import { PipelineProgressUpsertWithWhereUniqueWithoutPipelineInput } from './pipeline-progress-upsert-with-where-unique-without-pipeline.input';
import { PipelineProgressCreateManyPipelineInputEnvelope } from './pipeline-progress-create-many-pipeline-input-envelope.input';
import { PipelineProgressWhereUniqueInput } from './pipeline-progress-where-unique.input';
import { PipelineProgressUpdateWithWhereUniqueWithoutPipelineInput } from './pipeline-progress-update-with-where-unique-without-pipeline.input';
import { PipelineProgressUpdateManyWithWhereWithoutPipelineInput } from './pipeline-progress-update-many-with-where-without-pipeline.input';
import { PipelineProgressScalarWhereInput } from './pipeline-progress-scalar-where.input';

@InputType()
export class PipelineProgressUpdateManyWithoutPipelineNestedInput {
  @Field(() => [PipelineProgressCreateWithoutPipelineInput], { nullable: true })
  @Type(() => PipelineProgressCreateWithoutPipelineInput)
  create?: Array<PipelineProgressCreateWithoutPipelineInput>;

  @Field(() => [PipelineProgressCreateOrConnectWithoutPipelineInput], {
    nullable: true,
  })
  @Type(() => PipelineProgressCreateOrConnectWithoutPipelineInput)
  connectOrCreate?: Array<PipelineProgressCreateOrConnectWithoutPipelineInput>;

  @Field(() => [PipelineProgressUpsertWithWhereUniqueWithoutPipelineInput], {
    nullable: true,
  })
  @Type(() => PipelineProgressUpsertWithWhereUniqueWithoutPipelineInput)
  upsert?: Array<PipelineProgressUpsertWithWhereUniqueWithoutPipelineInput>;

  @Field(() => PipelineProgressCreateManyPipelineInputEnvelope, {
    nullable: true,
  })
  @Type(() => PipelineProgressCreateManyPipelineInputEnvelope)
  createMany?: PipelineProgressCreateManyPipelineInputEnvelope;

  @Field(() => [PipelineProgressWhereUniqueInput], { nullable: true })
  @Type(() => PipelineProgressWhereUniqueInput)
  set?: Array<PipelineProgressWhereUniqueInput>;

  @Field(() => [PipelineProgressWhereUniqueInput], { nullable: true })
  @Type(() => PipelineProgressWhereUniqueInput)
  disconnect?: Array<PipelineProgressWhereUniqueInput>;

  @Field(() => [PipelineProgressWhereUniqueInput], { nullable: true })
  @Type(() => PipelineProgressWhereUniqueInput)
  delete?: Array<PipelineProgressWhereUniqueInput>;

  @Field(() => [PipelineProgressWhereUniqueInput], { nullable: true })
  @Type(() => PipelineProgressWhereUniqueInput)
  connect?: Array<PipelineProgressWhereUniqueInput>;

  @Field(() => [PipelineProgressUpdateWithWhereUniqueWithoutPipelineInput], {
    nullable: true,
  })
  @Type(() => PipelineProgressUpdateWithWhereUniqueWithoutPipelineInput)
  update?: Array<PipelineProgressUpdateWithWhereUniqueWithoutPipelineInput>;

  @Field(() => [PipelineProgressUpdateManyWithWhereWithoutPipelineInput], {
    nullable: true,
  })
  @Type(() => PipelineProgressUpdateManyWithWhereWithoutPipelineInput)
  updateMany?: Array<PipelineProgressUpdateManyWithWhereWithoutPipelineInput>;

  @Field(() => [PipelineProgressScalarWhereInput], { nullable: true })
  @Type(() => PipelineProgressScalarWhereInput)
  deleteMany?: Array<PipelineProgressScalarWhereInput>;
}
