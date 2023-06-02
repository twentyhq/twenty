import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineWhereUniqueInput } from './pipeline-where-unique.input';
import { Type } from 'class-transformer';
import { PipelineCreateWithoutPipelineAssociationsInput } from './pipeline-create-without-pipeline-associations.input';

@InputType()
export class PipelineCreateOrConnectWithoutPipelineAssociationsInput {
  @Field(() => PipelineWhereUniqueInput, { nullable: false })
  @Type(() => PipelineWhereUniqueInput)
  where!: PipelineWhereUniqueInput;

  @Field(() => PipelineCreateWithoutPipelineAssociationsInput, {
    nullable: false,
  })
  @Type(() => PipelineCreateWithoutPipelineAssociationsInput)
  create!: PipelineCreateWithoutPipelineAssociationsInput;
}
