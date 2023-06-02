import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { PipelineAssociationWhereUniqueInput } from './pipeline-association-where-unique.input';
import { Type } from 'class-transformer';
import { PipelineAssociationCreateInput } from './pipeline-association-create.input';
import { PipelineAssociationUpdateInput } from './pipeline-association-update.input';

@ArgsType()
export class UpsertOnePipelineAssociationArgs {
  @Field(() => PipelineAssociationWhereUniqueInput, { nullable: false })
  @Type(() => PipelineAssociationWhereUniqueInput)
  where!: PipelineAssociationWhereUniqueInput;

  @Field(() => PipelineAssociationCreateInput, { nullable: false })
  @Type(() => PipelineAssociationCreateInput)
  create!: PipelineAssociationCreateInput;

  @Field(() => PipelineAssociationUpdateInput, { nullable: false })
  @Type(() => PipelineAssociationUpdateInput)
  update!: PipelineAssociationUpdateInput;
}
