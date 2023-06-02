import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineUpdateWithoutPipelineAssociationsInput } from './pipeline-update-without-pipeline-associations.input';
import { Type } from 'class-transformer';
import { PipelineCreateWithoutPipelineAssociationsInput } from './pipeline-create-without-pipeline-associations.input';

@InputType()
export class PipelineUpsertWithoutPipelineAssociationsInput {
  @Field(() => PipelineUpdateWithoutPipelineAssociationsInput, {
    nullable: false,
  })
  @Type(() => PipelineUpdateWithoutPipelineAssociationsInput)
  update!: PipelineUpdateWithoutPipelineAssociationsInput;

  @Field(() => PipelineCreateWithoutPipelineAssociationsInput, {
    nullable: false,
  })
  @Type(() => PipelineCreateWithoutPipelineAssociationsInput)
  create!: PipelineCreateWithoutPipelineAssociationsInput;
}
