import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { HideField } from '@nestjs/graphql';
import { PipelineStageUncheckedCreateNestedManyWithoutPipelineInput } from '../pipeline-stage/pipeline-stage-unchecked-create-nested-many-without-pipeline.input';
import { PipelineProgressUncheckedCreateNestedManyWithoutPipelineInput } from '../pipeline-progress/pipeline-progress-unchecked-create-nested-many-without-pipeline.input';

@InputType()
export class PipelineUncheckedCreateInput {
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

  @HideField()
  workspaceId!: string;

  @Field(() => PipelineStageUncheckedCreateNestedManyWithoutPipelineInput, {
    nullable: true,
  })
  pipelineStages?: PipelineStageUncheckedCreateNestedManyWithoutPipelineInput;

  @Field(() => PipelineProgressUncheckedCreateNestedManyWithoutPipelineInput, {
    nullable: true,
  })
  pipelineProgresses?: PipelineProgressUncheckedCreateNestedManyWithoutPipelineInput;
}
