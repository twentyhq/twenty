import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceCreateWithoutPipelineProgressesInput } from './workspace-create-without-pipeline-progresses.input';
import { Type } from 'class-transformer';
import { WorkspaceCreateOrConnectWithoutPipelineProgressesInput } from './workspace-create-or-connect-without-pipeline-progresses.input';
import { WorkspaceUpsertWithoutPipelineProgressesInput } from './workspace-upsert-without-pipeline-progresses.input';
import { WorkspaceWhereUniqueInput } from './workspace-where-unique.input';
import { WorkspaceUpdateWithoutPipelineProgressesInput } from './workspace-update-without-pipeline-progresses.input';

@InputType()
export class WorkspaceUpdateOneRequiredWithoutPipelineProgressesNestedInput {
  @Field(() => WorkspaceCreateWithoutPipelineProgressesInput, {
    nullable: true,
  })
  @Type(() => WorkspaceCreateWithoutPipelineProgressesInput)
  create?: WorkspaceCreateWithoutPipelineProgressesInput;

  @Field(() => WorkspaceCreateOrConnectWithoutPipelineProgressesInput, {
    nullable: true,
  })
  @Type(() => WorkspaceCreateOrConnectWithoutPipelineProgressesInput)
  connectOrCreate?: WorkspaceCreateOrConnectWithoutPipelineProgressesInput;

  @Field(() => WorkspaceUpsertWithoutPipelineProgressesInput, {
    nullable: true,
  })
  @Type(() => WorkspaceUpsertWithoutPipelineProgressesInput)
  upsert?: WorkspaceUpsertWithoutPipelineProgressesInput;

  @Field(() => WorkspaceWhereUniqueInput, { nullable: true })
  @Type(() => WorkspaceWhereUniqueInput)
  connect?: WorkspaceWhereUniqueInput;

  @Field(() => WorkspaceUpdateWithoutPipelineProgressesInput, {
    nullable: true,
  })
  @Type(() => WorkspaceUpdateWithoutPipelineProgressesInput)
  update?: WorkspaceUpdateWithoutPipelineProgressesInput;
}
