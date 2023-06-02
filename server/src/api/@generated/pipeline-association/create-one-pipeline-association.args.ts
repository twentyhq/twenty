import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { PipelineAssociationCreateInput } from './pipeline-association-create.input';
import { Type } from 'class-transformer';

@ArgsType()
export class CreateOnePipelineAssociationArgs {
  @Field(() => PipelineAssociationCreateInput, { nullable: false })
  @Type(() => PipelineAssociationCreateInput)
  data!: PipelineAssociationCreateInput;
}
