import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { HideField } from '@nestjs/graphql';
import { PipelineAssociationUncheckedCreateNestedManyWithoutPipelineInput } from '../pipeline-association/pipeline-association-unchecked-create-nested-many-without-pipeline.input';

@InputType()
export class PipelineUncheckedCreateWithoutPipelineStagesInput {
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
  icon!: string;

  @HideField()
  workspaceId!: string;

  @Field(
    () => PipelineAssociationUncheckedCreateNestedManyWithoutPipelineInput,
    { nullable: true },
  )
  pipelineAssociations?: PipelineAssociationUncheckedCreateNestedManyWithoutPipelineInput;
}
