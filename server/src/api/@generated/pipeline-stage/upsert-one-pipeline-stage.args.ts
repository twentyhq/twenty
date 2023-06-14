import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { PipelineStageWhereUniqueInput } from './pipeline-stage-where-unique.input';
import { Type } from 'class-transformer';
import { PipelineStageCreateInput } from './pipeline-stage-create.input';
import { PipelineStageUpdateInput } from './pipeline-stage-update.input';

@ArgsType()
export class UpsertOnePipelineStageArgs {
  @Field(() => PipelineStageWhereUniqueInput, { nullable: false })
  @Type(() => PipelineStageWhereUniqueInput)
  where!: PipelineStageWhereUniqueInput;

  @Field(() => PipelineStageCreateInput, { nullable: false })
  @Type(() => PipelineStageCreateInput)
  create!: PipelineStageCreateInput;

  @Field(() => PipelineStageUpdateInput, { nullable: false })
  @Type(() => PipelineStageUpdateInput)
  update!: PipelineStageUpdateInput;
}
