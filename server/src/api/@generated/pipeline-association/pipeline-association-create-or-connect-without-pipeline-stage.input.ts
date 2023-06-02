import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineAssociationWhereUniqueInput } from './pipeline-association-where-unique.input';
import { Type } from 'class-transformer';
import { PipelineAssociationCreateWithoutPipelineStageInput } from './pipeline-association-create-without-pipeline-stage.input';

@InputType()
export class PipelineAssociationCreateOrConnectWithoutPipelineStageInput {
  @Field(() => PipelineAssociationWhereUniqueInput, { nullable: false })
  @Type(() => PipelineAssociationWhereUniqueInput)
  where!: PipelineAssociationWhereUniqueInput;

  @Field(() => PipelineAssociationCreateWithoutPipelineStageInput, {
    nullable: false,
  })
  @Type(() => PipelineAssociationCreateWithoutPipelineStageInput)
  create!: PipelineAssociationCreateWithoutPipelineStageInput;
}
