import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineAssociationWhereUniqueInput } from './pipeline-association-where-unique.input';
import { Type } from 'class-transformer';
import { PipelineAssociationUpdateWithoutPipelineInput } from './pipeline-association-update-without-pipeline.input';

@InputType()
export class PipelineAssociationUpdateWithWhereUniqueWithoutPipelineInput {
  @Field(() => PipelineAssociationWhereUniqueInput, { nullable: false })
  @Type(() => PipelineAssociationWhereUniqueInput)
  where!: PipelineAssociationWhereUniqueInput;

  @Field(() => PipelineAssociationUpdateWithoutPipelineInput, {
    nullable: false,
  })
  @Type(() => PipelineAssociationUpdateWithoutPipelineInput)
  data!: PipelineAssociationUpdateWithoutPipelineInput;
}
