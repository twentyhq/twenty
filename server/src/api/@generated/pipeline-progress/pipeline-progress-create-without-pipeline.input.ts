import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineProgressableType } from '../prisma/pipeline-progressable-type.enum';
import { PipelineStageCreateNestedOneWithoutPipelineProgressesInput } from '../pipeline-stage/pipeline-stage-create-nested-one-without-pipeline-progresses.input';

@InputType()
export class PipelineProgressCreateWithoutPipelineInput {
  @Field(() => String, { nullable: false })
  id!: string;

  @Field(() => Date, { nullable: true })
  createdAt?: Date | string;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date | string;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date | string;

  @Field(() => PipelineProgressableType, { nullable: false })
  associableType!: keyof typeof PipelineProgressableType;

  @Field(() => String, { nullable: false })
  associableId!: string;

  @Field(() => PipelineStageCreateNestedOneWithoutPipelineProgressesInput, {
    nullable: false,
  })
  pipelineStage!: PipelineStageCreateNestedOneWithoutPipelineProgressesInput;
}
