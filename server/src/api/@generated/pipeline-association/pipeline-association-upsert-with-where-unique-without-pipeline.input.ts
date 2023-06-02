import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineAssociationWhereUniqueInput } from './pipeline-association-where-unique.input';
import { Type } from 'class-transformer';
import { PipelineAssociationUpdateWithoutPipelineInput } from './pipeline-association-update-without-pipeline.input';
import { PipelineAssociationCreateWithoutPipelineInput } from './pipeline-association-create-without-pipeline.input';

@InputType()
export class PipelineAssociationUpsertWithWhereUniqueWithoutPipelineInput {
  @Field(() => PipelineAssociationWhereUniqueInput, { nullable: false })
  @Type(() => PipelineAssociationWhereUniqueInput)
  where!: PipelineAssociationWhereUniqueInput;

  @Field(() => PipelineAssociationUpdateWithoutPipelineInput, {
    nullable: false,
  })
  @Type(() => PipelineAssociationUpdateWithoutPipelineInput)
  update!: PipelineAssociationUpdateWithoutPipelineInput;

  @Field(() => PipelineAssociationCreateWithoutPipelineInput, {
    nullable: false,
  })
  @Type(() => PipelineAssociationCreateWithoutPipelineInput)
  create!: PipelineAssociationCreateWithoutPipelineInput;
}
