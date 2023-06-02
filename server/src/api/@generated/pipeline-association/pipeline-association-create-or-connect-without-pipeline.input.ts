import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineAssociationWhereUniqueInput } from './pipeline-association-where-unique.input';
import { Type } from 'class-transformer';
import { PipelineAssociationCreateWithoutPipelineInput } from './pipeline-association-create-without-pipeline.input';

@InputType()
export class PipelineAssociationCreateOrConnectWithoutPipelineInput {
  @Field(() => PipelineAssociationWhereUniqueInput, { nullable: false })
  @Type(() => PipelineAssociationWhereUniqueInput)
  where!: PipelineAssociationWhereUniqueInput;

  @Field(() => PipelineAssociationCreateWithoutPipelineInput, {
    nullable: false,
  })
  @Type(() => PipelineAssociationCreateWithoutPipelineInput)
  create!: PipelineAssociationCreateWithoutPipelineInput;
}
