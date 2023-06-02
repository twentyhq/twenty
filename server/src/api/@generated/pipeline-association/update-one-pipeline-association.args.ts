import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { PipelineAssociationUpdateInput } from './pipeline-association-update.input';
import { Type } from 'class-transformer';
import { PipelineAssociationWhereUniqueInput } from './pipeline-association-where-unique.input';

@ArgsType()
export class UpdateOnePipelineAssociationArgs {
  @Field(() => PipelineAssociationUpdateInput, { nullable: false })
  @Type(() => PipelineAssociationUpdateInput)
  data!: PipelineAssociationUpdateInput;

  @Field(() => PipelineAssociationWhereUniqueInput, { nullable: false })
  @Type(() => PipelineAssociationWhereUniqueInput)
  where!: PipelineAssociationWhereUniqueInput;
}
