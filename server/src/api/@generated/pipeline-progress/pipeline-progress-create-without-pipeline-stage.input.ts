import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineProgressableType } from '../prisma/pipeline-progressable-type.enum';
import { PipelineCreateNestedOneWithoutPipelineProgressesInput } from '../pipeline/pipeline-create-nested-one-without-pipeline-progresses.input';

@InputType()
export class PipelineProgressCreateWithoutPipelineStageInput {
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

  @Field(() => PipelineCreateNestedOneWithoutPipelineProgressesInput, {
    nullable: false,
  })
  pipeline!: PipelineCreateNestedOneWithoutPipelineProgressesInput;
}
