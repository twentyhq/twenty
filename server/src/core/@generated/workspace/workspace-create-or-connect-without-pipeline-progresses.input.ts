import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceWhereUniqueInput } from './workspace-where-unique.input';
import { Type } from 'class-transformer';
import { WorkspaceCreateWithoutPipelineProgressesInput } from './workspace-create-without-pipeline-progresses.input';

@InputType()
export class WorkspaceCreateOrConnectWithoutPipelineProgressesInput {
  @Field(() => WorkspaceWhereUniqueInput, { nullable: false })
  @Type(() => WorkspaceWhereUniqueInput)
  where!: WorkspaceWhereUniqueInput;

  @Field(() => WorkspaceCreateWithoutPipelineProgressesInput, {
    nullable: false,
  })
  @Type(() => WorkspaceCreateWithoutPipelineProgressesInput)
  create!: WorkspaceCreateWithoutPipelineProgressesInput;
}
