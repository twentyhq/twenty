import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineAssociationWhereUniqueInput } from './pipeline-association-where-unique.input';
import { Type } from 'class-transformer';
import { PipelineAssociationUpdateWithoutPipelineStageInput } from './pipeline-association-update-without-pipeline-stage.input';

@InputType()
export class PipelineAssociationUpdateWithWhereUniqueWithoutPipelineStageInput {
  @Field(() => PipelineAssociationWhereUniqueInput, { nullable: false })
  @Type(() => PipelineAssociationWhereUniqueInput)
  where!: PipelineAssociationWhereUniqueInput;

  @Field(() => PipelineAssociationUpdateWithoutPipelineStageInput, {
    nullable: false,
  })
  @Type(() => PipelineAssociationUpdateWithoutPipelineStageInput)
  data!: PipelineAssociationUpdateWithoutPipelineStageInput;
}
