import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PipelineScalarWhereInput } from './pipeline-scalar-where.input';
import { Type } from 'class-transformer';
import { PipelineUpdateManyMutationInput } from './pipeline-update-many-mutation.input';

@InputType()
export class PipelineUpdateManyWithWhereWithoutWorkspaceInput {
  @Field(() => PipelineScalarWhereInput, { nullable: false })
  @Type(() => PipelineScalarWhereInput)
  where!: PipelineScalarWhereInput;

  @Field(() => PipelineUpdateManyMutationInput, { nullable: false })
  @Type(() => PipelineUpdateManyMutationInput)
  data!: PipelineUpdateManyMutationInput;
}
