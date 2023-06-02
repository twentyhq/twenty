import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceWhereUniqueInput } from './workspace-where-unique.input';
import { Type } from 'class-transformer';
import { WorkspaceCreateWithoutPipelineStagesInput } from './workspace-create-without-pipeline-stages.input';

@InputType()
export class WorkspaceCreateOrConnectWithoutPipelineStagesInput {
  @Field(() => WorkspaceWhereUniqueInput, { nullable: false })
  @Type(() => WorkspaceWhereUniqueInput)
  where!: WorkspaceWhereUniqueInput;

  @Field(() => WorkspaceCreateWithoutPipelineStagesInput, { nullable: false })
  @Type(() => WorkspaceCreateWithoutPipelineStagesInput)
  create!: WorkspaceCreateWithoutPipelineStagesInput;
}
