import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { PipelineAssociationUpdateManyMutationInput } from './pipeline-association-update-many-mutation.input';
import { Type } from 'class-transformer';
import { PipelineAssociationWhereInput } from './pipeline-association-where.input';

@ArgsType()
export class UpdateManyPipelineAssociationArgs {
  @Field(() => PipelineAssociationUpdateManyMutationInput, { nullable: false })
  @Type(() => PipelineAssociationUpdateManyMutationInput)
  data!: PipelineAssociationUpdateManyMutationInput;

  @Field(() => PipelineAssociationWhereInput, { nullable: true })
  @Type(() => PipelineAssociationWhereInput)
  where?: PipelineAssociationWhereInput;
}
