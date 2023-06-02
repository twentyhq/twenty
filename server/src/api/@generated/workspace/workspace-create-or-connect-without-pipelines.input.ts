import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceWhereUniqueInput } from './workspace-where-unique.input';
import { Type } from 'class-transformer';
import { WorkspaceCreateWithoutPipelinesInput } from './workspace-create-without-pipelines.input';

@InputType()
export class WorkspaceCreateOrConnectWithoutPipelinesInput {
  @Field(() => WorkspaceWhereUniqueInput, { nullable: false })
  @Type(() => WorkspaceWhereUniqueInput)
  where!: WorkspaceWhereUniqueInput;

  @Field(() => WorkspaceCreateWithoutPipelinesInput, { nullable: false })
  @Type(() => WorkspaceCreateWithoutPipelinesInput)
  create!: WorkspaceCreateWithoutPipelinesInput;
}
