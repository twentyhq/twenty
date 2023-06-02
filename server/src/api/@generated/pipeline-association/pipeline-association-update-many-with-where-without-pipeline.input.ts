import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineAssociationScalarWhereInput } from './pipeline-association-scalar-where.input';
import { Type } from 'class-transformer';
import { PipelineAssociationUpdateManyMutationInput } from './pipeline-association-update-many-mutation.input';

@InputType()
export class PipelineAssociationUpdateManyWithWhereWithoutPipelineInput {
  @Field(() => PipelineAssociationScalarWhereInput, { nullable: false })
  @Type(() => PipelineAssociationScalarWhereInput)
  where!: PipelineAssociationScalarWhereInput;

  @Field(() => PipelineAssociationUpdateManyMutationInput, { nullable: false })
  @Type(() => PipelineAssociationUpdateManyMutationInput)
  data!: PipelineAssociationUpdateManyMutationInput;
}
