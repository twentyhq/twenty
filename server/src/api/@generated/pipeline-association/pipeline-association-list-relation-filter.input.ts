import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineAssociationWhereInput } from './pipeline-association-where.input';

@InputType()
export class PipelineAssociationListRelationFilter {
  @Field(() => PipelineAssociationWhereInput, { nullable: true })
  every?: PipelineAssociationWhereInput;

  @Field(() => PipelineAssociationWhereInput, { nullable: true })
  some?: PipelineAssociationWhereInput;

  @Field(() => PipelineAssociationWhereInput, { nullable: true })
  none?: PipelineAssociationWhereInput;
}
