import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineAssociationWhereUniqueInput } from './pipeline-association-where-unique.input';
import { Type } from 'class-transformer';
import { PipelineAssociationUpdateWithoutPipelineStageInput } from './pipeline-association-update-without-pipeline-stage.input';
import { PipelineAssociationCreateWithoutPipelineStageInput } from './pipeline-association-create-without-pipeline-stage.input';

@InputType()
export class PipelineAssociationUpsertWithWhereUniqueWithoutPipelineStageInput {
  @Field(() => PipelineAssociationWhereUniqueInput, { nullable: false })
  @Type(() => PipelineAssociationWhereUniqueInput)
  where!: PipelineAssociationWhereUniqueInput;

  @Field(() => PipelineAssociationUpdateWithoutPipelineStageInput, {
    nullable: false,
  })
  @Type(() => PipelineAssociationUpdateWithoutPipelineStageInput)
  update!: PipelineAssociationUpdateWithoutPipelineStageInput;

  @Field(() => PipelineAssociationCreateWithoutPipelineStageInput, {
    nullable: false,
  })
  @Type(() => PipelineAssociationCreateWithoutPipelineStageInput)
  create!: PipelineAssociationCreateWithoutPipelineStageInput;
}
