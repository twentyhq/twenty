import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineAssociableType } from '../pipeline/pipeline-associable-type.enum';
import { PipelineCreateNestedOneWithoutPipelineAssociationsInput } from '../pipeline/pipeline-create-nested-one-without-pipeline-associations.input';

@InputType()
export class PipelineAssociationCreateWithoutPipelineStageInput {
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

  @Field(() => PipelineCreateNestedOneWithoutPipelineAssociationsInput, {
    nullable: false,
  })
  pipeline!: PipelineCreateNestedOneWithoutPipelineAssociationsInput;
}
