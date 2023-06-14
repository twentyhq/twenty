import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineProgressCreateWithoutWorkspaceInput } from './pipeline-progress-create-without-workspace.input';
import { Type } from 'class-transformer';
import { PipelineProgressCreateOrConnectWithoutWorkspaceInput } from './pipeline-progress-create-or-connect-without-workspace.input';
import { PipelineProgressUpsertWithWhereUniqueWithoutWorkspaceInput } from './pipeline-progress-upsert-with-where-unique-without-workspace.input';
import { PipelineProgressCreateManyWorkspaceInputEnvelope } from './pipeline-progress-create-many-workspace-input-envelope.input';
import { PipelineProgressWhereUniqueInput } from './pipeline-progress-where-unique.input';
import { PipelineProgressUpdateWithWhereUniqueWithoutWorkspaceInput } from './pipeline-progress-update-with-where-unique-without-workspace.input';
import { PipelineProgressUpdateManyWithWhereWithoutWorkspaceInput } from './pipeline-progress-update-many-with-where-without-workspace.input';
import { PipelineProgressScalarWhereInput } from './pipeline-progress-scalar-where.input';

@InputType()
export class PipelineProgressUpdateManyWithoutWorkspaceNestedInput {
  @Field(() => [PipelineProgressCreateWithoutWorkspaceInput], {
    nullable: true,
  })
  @Type(() => PipelineProgressCreateWithoutWorkspaceInput)
  create?: Array<PipelineProgressCreateWithoutWorkspaceInput>;

  @Field(() => [PipelineProgressCreateOrConnectWithoutWorkspaceInput], {
    nullable: true,
  })
  @Type(() => PipelineProgressCreateOrConnectWithoutWorkspaceInput)
  connectOrCreate?: Array<PipelineProgressCreateOrConnectWithoutWorkspaceInput>;

  @Field(() => [PipelineProgressUpsertWithWhereUniqueWithoutWorkspaceInput], {
    nullable: true,
  })
  @Type(() => PipelineProgressUpsertWithWhereUniqueWithoutWorkspaceInput)
  upsert?: Array<PipelineProgressUpsertWithWhereUniqueWithoutWorkspaceInput>;

  @Field(() => PipelineProgressCreateManyWorkspaceInputEnvelope, {
    nullable: true,
  })
  @Type(() => PipelineProgressCreateManyWorkspaceInputEnvelope)
  createMany?: PipelineProgressCreateManyWorkspaceInputEnvelope;

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

  @Field(() => [PipelineProgressUpdateWithWhereUniqueWithoutWorkspaceInput], {
    nullable: true,
  })
  @Type(() => PipelineProgressUpdateWithWhereUniqueWithoutWorkspaceInput)
  update?: Array<PipelineProgressUpdateWithWhereUniqueWithoutWorkspaceInput>;

  @Field(() => [PipelineProgressUpdateManyWithWhereWithoutWorkspaceInput], {
    nullable: true,
  })
  @Type(() => PipelineProgressUpdateManyWithWhereWithoutWorkspaceInput)
  updateMany?: Array<PipelineProgressUpdateManyWithWhereWithoutWorkspaceInput>;

  @Field(() => [PipelineProgressScalarWhereInput], { nullable: true })
  @Type(() => PipelineProgressScalarWhereInput)
  deleteMany?: Array<PipelineProgressScalarWhereInput>;
}
