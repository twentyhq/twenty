import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineProgressableType } from '../prisma/pipeline-progressable-type.enum';
import { HideField } from '@nestjs/graphql';
import { PipelineProgressUncheckedCreateNestedManyWithoutPipelineInput } from '../pipeline-progress/pipeline-progress-unchecked-create-nested-many-without-pipeline.input';

@InputType()
export class PipelineUncheckedCreateWithoutPipelineStagesInput {
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

  @Field(() => PipelineProgressableType, { nullable: true })
  pipelineProgressableType?: keyof typeof PipelineProgressableType;

  @HideField()
  workspaceId!: string;

  @Field(() => PipelineProgressUncheckedCreateNestedManyWithoutPipelineInput, {
    nullable: true,
  })
  pipelineProgresses?: PipelineProgressUncheckedCreateNestedManyWithoutPipelineInput;
}
