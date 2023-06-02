import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { PipelineProgressUpdateManyMutationInput } from './pipeline-progress-update-many-mutation.input';
import { Type } from 'class-transformer';
import { PipelineProgressWhereInput } from './pipeline-progress-where.input';

@ArgsType()
export class UpdateManyPipelineProgressArgs {
  @Field(() => PipelineProgressUpdateManyMutationInput, { nullable: false })
  @Type(() => PipelineProgressUpdateManyMutationInput)
  data!: PipelineProgressUpdateManyMutationInput;

  @Field(() => PipelineProgressWhereInput, { nullable: true })
  @Type(() => PipelineProgressWhereInput)
  where?: PipelineProgressWhereInput;
}
