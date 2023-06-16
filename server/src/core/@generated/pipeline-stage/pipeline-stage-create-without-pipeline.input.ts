import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineProgressCreateNestedManyWithoutPipelineStageInput } from '../pipeline-progress/pipeline-progress-create-nested-many-without-pipeline-stage.input';
import { WorkspaceCreateNestedOneWithoutPipelineStagesInput } from '../workspace/workspace-create-nested-one-without-pipeline-stages.input';
import { HideField } from '@nestjs/graphql';

@InputType()
export class PipelineStageCreateWithoutPipelineInput {
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
  type!: string;

  @Field(() => String, { nullable: false })
  color!: string;

  @Field(() => PipelineProgressCreateNestedManyWithoutPipelineStageInput, {
    nullable: true,
  })
  pipelineProgresses?: PipelineProgressCreateNestedManyWithoutPipelineStageInput;

  @HideField()
  workspace!: WorkspaceCreateNestedOneWithoutPipelineStagesInput;
}
