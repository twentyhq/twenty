import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineCreateWithoutWorkspaceInput } from './pipeline-create-without-workspace.input';
import { Type } from 'class-transformer';
import { PipelineCreateOrConnectWithoutWorkspaceInput } from './pipeline-create-or-connect-without-workspace.input';
import { PipelineUpsertWithWhereUniqueWithoutWorkspaceInput } from './pipeline-upsert-with-where-unique-without-workspace.input';
import { PipelineCreateManyWorkspaceInputEnvelope } from './pipeline-create-many-workspace-input-envelope.input';
import { PipelineWhereUniqueInput } from './pipeline-where-unique.input';
import { PipelineUpdateWithWhereUniqueWithoutWorkspaceInput } from './pipeline-update-with-where-unique-without-workspace.input';
import { PipelineUpdateManyWithWhereWithoutWorkspaceInput } from './pipeline-update-many-with-where-without-workspace.input';
import { PipelineScalarWhereInput } from './pipeline-scalar-where.input';

@InputType()
export class PipelineUpdateManyWithoutWorkspaceNestedInput {
  @Field(() => [PipelineCreateWithoutWorkspaceInput], { nullable: true })
  @Type(() => PipelineCreateWithoutWorkspaceInput)
  create?: Array<PipelineCreateWithoutWorkspaceInput>;

  @Field(() => [PipelineCreateOrConnectWithoutWorkspaceInput], {
    nullable: true,
  })
  @Type(() => PipelineCreateOrConnectWithoutWorkspaceInput)
  connectOrCreate?: Array<PipelineCreateOrConnectWithoutWorkspaceInput>;

  @Field(() => [PipelineUpsertWithWhereUniqueWithoutWorkspaceInput], {
    nullable: true,
  })
  @Type(() => PipelineUpsertWithWhereUniqueWithoutWorkspaceInput)
  upsert?: Array<PipelineUpsertWithWhereUniqueWithoutWorkspaceInput>;

  @Field(() => PipelineCreateManyWorkspaceInputEnvelope, { nullable: true })
  @Type(() => PipelineCreateManyWorkspaceInputEnvelope)
  createMany?: PipelineCreateManyWorkspaceInputEnvelope;

  @Field(() => [PipelineWhereUniqueInput], { nullable: true })
  @Type(() => PipelineWhereUniqueInput)
  set?: Array<PipelineWhereUniqueInput>;

  @Field(() => [PipelineWhereUniqueInput], { nullable: true })
  @Type(() => PipelineWhereUniqueInput)
  disconnect?: Array<PipelineWhereUniqueInput>;

  @Field(() => [PipelineWhereUniqueInput], { nullable: true })
  @Type(() => PipelineWhereUniqueInput)
  delete?: Array<PipelineWhereUniqueInput>;

  @Field(() => [PipelineWhereUniqueInput], { nullable: true })
  @Type(() => PipelineWhereUniqueInput)
  connect?: Array<PipelineWhereUniqueInput>;

  @Field(() => [PipelineUpdateWithWhereUniqueWithoutWorkspaceInput], {
    nullable: true,
  })
  @Type(() => PipelineUpdateWithWhereUniqueWithoutWorkspaceInput)
  update?: Array<PipelineUpdateWithWhereUniqueWithoutWorkspaceInput>;

  @Field(() => [PipelineUpdateManyWithWhereWithoutWorkspaceInput], {
    nullable: true,
  })
  @Type(() => PipelineUpdateManyWithWhereWithoutWorkspaceInput)
  updateMany?: Array<PipelineUpdateManyWithWhereWithoutWorkspaceInput>;

  @Field(() => [PipelineScalarWhereInput], { nullable: true })
  @Type(() => PipelineScalarWhereInput)
  deleteMany?: Array<PipelineScalarWhereInput>;
}
