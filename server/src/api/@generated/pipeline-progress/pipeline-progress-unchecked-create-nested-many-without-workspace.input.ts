import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineProgressCreateWithoutWorkspaceInput } from './pipeline-progress-create-without-workspace.input';
import { Type } from 'class-transformer';
import { PipelineProgressCreateOrConnectWithoutWorkspaceInput } from './pipeline-progress-create-or-connect-without-workspace.input';
import { PipelineProgressCreateManyWorkspaceInputEnvelope } from './pipeline-progress-create-many-workspace-input-envelope.input';
import { PipelineProgressWhereUniqueInput } from './pipeline-progress-where-unique.input';

@InputType()
export class PipelineProgressUncheckedCreateNestedManyWithoutWorkspaceInput {
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

  @Field(() => PipelineProgressCreateManyWorkspaceInputEnvelope, {
    nullable: true,
  })
  @Type(() => PipelineProgressCreateManyWorkspaceInputEnvelope)
  createMany?: PipelineProgressCreateManyWorkspaceInputEnvelope;

  @Field(() => [PipelineProgressWhereUniqueInput], { nullable: true })
  @Type(() => PipelineProgressWhereUniqueInput)
  connect?: Array<PipelineProgressWhereUniqueInput>;
}
