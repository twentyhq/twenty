import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineProgressWhereUniqueInput } from './pipeline-progress-where-unique.input';
import { Type } from 'class-transformer';
import { PipelineProgressCreateWithoutWorkspaceInput } from './pipeline-progress-create-without-workspace.input';

@InputType()
export class PipelineProgressCreateOrConnectWithoutWorkspaceInput {
  @Field(() => PipelineProgressWhereUniqueInput, { nullable: false })
  @Type(() => PipelineProgressWhereUniqueInput)
  where!: PipelineProgressWhereUniqueInput;

  @Field(() => PipelineProgressCreateWithoutWorkspaceInput, { nullable: false })
  @Type(() => PipelineProgressCreateWithoutWorkspaceInput)
  create!: PipelineProgressCreateWithoutWorkspaceInput;
}
