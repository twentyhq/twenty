import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { PipelineProgressWhereUniqueInput } from './pipeline-progress-where-unique.input';
import { Type } from 'class-transformer';
import { PipelineProgressCreateInput } from './pipeline-progress-create.input';
import { PipelineProgressUpdateInput } from './pipeline-progress-update.input';

@ArgsType()
export class UpsertOnePipelineProgressArgs {
  @Field(() => PipelineProgressWhereUniqueInput, { nullable: false })
  @Type(() => PipelineProgressWhereUniqueInput)
  where!: PipelineProgressWhereUniqueInput;

  @Field(() => PipelineProgressCreateInput, { nullable: false })
  @Type(() => PipelineProgressCreateInput)
  create!: PipelineProgressCreateInput;

  @Field(() => PipelineProgressUpdateInput, { nullable: false })
  @Type(() => PipelineProgressUpdateInput)
  update!: PipelineProgressUpdateInput;
}
