import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceUpdateWithoutPipelinesInput } from './workspace-update-without-pipelines.input';
import { Type } from 'class-transformer';
import { WorkspaceCreateWithoutPipelinesInput } from './workspace-create-without-pipelines.input';

@InputType()
export class WorkspaceUpsertWithoutPipelinesInput {
  @Field(() => WorkspaceUpdateWithoutPipelinesInput, { nullable: false })
  @Type(() => WorkspaceUpdateWithoutPipelinesInput)
  update!: WorkspaceUpdateWithoutPipelinesInput;

  @Field(() => WorkspaceCreateWithoutPipelinesInput, { nullable: false })
  @Type(() => WorkspaceCreateWithoutPipelinesInput)
  create!: WorkspaceCreateWithoutPipelinesInput;
}
