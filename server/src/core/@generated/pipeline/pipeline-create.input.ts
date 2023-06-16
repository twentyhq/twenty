import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineStageCreateNestedManyWithoutPipelineInput } from '../pipeline-stage/pipeline-stage-create-nested-many-without-pipeline.input';
import { PipelineProgressCreateNestedManyWithoutPipelineInput } from '../pipeline-progress/pipeline-progress-create-nested-many-without-pipeline.input';
import { WorkspaceCreateNestedOneWithoutPipelinesInput } from '../workspace/workspace-create-nested-one-without-pipelines.input';
import { HideField } from '@nestjs/graphql';

@InputType()
export class PipelineCreateInput {
  @Field(() => String, { nullable: true })
  id?: string;

  @Field(() => Date, { nullable: true })
  createdAt?: Date | string;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date | string;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date | string;

  @Field(() => String, { nullable: false })
  name!: string;

  @Field(() => String, { nullable: false })
  icon!: string;

  @Field(() => PipelineStageCreateNestedManyWithoutPipelineInput, {
    nullable: true,
  })
  pipelineStages?: PipelineStageCreateNestedManyWithoutPipelineInput;

  @Field(() => PipelineProgressCreateNestedManyWithoutPipelineInput, {
    nullable: true,
  })
  pipelineProgresses?: PipelineProgressCreateNestedManyWithoutPipelineInput;

  @HideField()
  workspace!: WorkspaceCreateNestedOneWithoutPipelinesInput;
}
