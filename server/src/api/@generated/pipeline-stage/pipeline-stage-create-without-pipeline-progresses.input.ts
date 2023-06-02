import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineCreateNestedOneWithoutPipelineStagesInput } from '../pipeline/pipeline-create-nested-one-without-pipeline-stages.input';
import { WorkspaceCreateNestedOneWithoutPipelineStagesInput } from '../workspace/workspace-create-nested-one-without-pipeline-stages.input';
import { HideField } from '@nestjs/graphql';

@InputType()
export class PipelineStageCreateWithoutPipelineProgressesInput {
  @Field(() => String, { nullable: false })
  id!: string;

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

  @Field(() => PipelineCreateNestedOneWithoutPipelineStagesInput, {
    nullable: false,
  })
  pipeline!: PipelineCreateNestedOneWithoutPipelineStagesInput;

  @HideField()
  workspace!: WorkspaceCreateNestedOneWithoutPipelineStagesInput;
}
