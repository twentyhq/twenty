import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { PipelineAssociationWhereInput } from './pipeline-association-where.input';
import { Type } from 'class-transformer';

@ArgsType()
export class DeleteManyPipelineAssociationArgs {
  @Field(() => PipelineAssociationWhereInput, { nullable: true })
  @Type(() => PipelineAssociationWhereInput)
  where?: PipelineAssociationWhereInput;
}
