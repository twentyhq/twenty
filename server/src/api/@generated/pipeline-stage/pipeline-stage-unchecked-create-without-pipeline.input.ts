import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { HideField } from '@nestjs/graphql';
import { PipelineAssociationUncheckedCreateNestedManyWithoutPipelineStageInput } from '../pipeline-association/pipeline-association-unchecked-create-nested-many-without-pipeline-stage.input';

@InputType()
export class PipelineStageUncheckedCreateWithoutPipelineInput {
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

  @HideField()
  workspaceId!: string;

  @Field(
    () => PipelineAssociationUncheckedCreateNestedManyWithoutPipelineStageInput,
    { nullable: true },
  )
  pipelineAssociations?: PipelineAssociationUncheckedCreateNestedManyWithoutPipelineStageInput;
}
