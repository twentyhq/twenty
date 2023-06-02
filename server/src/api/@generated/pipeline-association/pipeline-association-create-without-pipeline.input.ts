import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineAssociableType } from '../pipeline/pipeline-associable-type.enum';
import { PipelineStageCreateNestedOneWithoutPipelineAssociationsInput } from '../pipeline-stage/pipeline-stage-create-nested-one-without-pipeline-associations.input';

@InputType()
export class PipelineAssociationCreateWithoutPipelineInput {
  @Field(() => String, { nullable: false })
  id!: string;

  @Field(() => Date, { nullable: true })
  createdAt?: Date | string;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date | string;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date | string;

  @Field(() => PipelineAssociableType, { nullable: false })
  associableType!: keyof typeof PipelineAssociableType;

  @Field(() => String, { nullable: false })
  associableId!: string;

  @Field(() => PipelineStageCreateNestedOneWithoutPipelineAssociationsInput, {
    nullable: false,
  })
  pipelineStage!: PipelineStageCreateNestedOneWithoutPipelineAssociationsInput;
}
