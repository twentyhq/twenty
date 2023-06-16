import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringFilter } from '../prisma/string-filter.input';
import { DateTimeFilter } from '../prisma/date-time-filter.input';
import { DateTimeNullableFilter } from '../prisma/date-time-nullable-filter.input';
import { EnumPipelineProgressableTypeFilter } from '../prisma/enum-pipeline-progressable-type-filter.input';
import { HideField } from '@nestjs/graphql';
import { PipelineRelationFilter } from '../pipeline/pipeline-relation-filter.input';
import { PipelineStageRelationFilter } from '../pipeline-stage/pipeline-stage-relation-filter.input';
import { WorkspaceRelationFilter } from '../workspace/workspace-relation-filter.input';

@InputType()
export class PipelineProgressWhereInput {
  @Field(() => [PipelineProgressWhereInput], { nullable: true })
  AND?: Array<PipelineProgressWhereInput>;

  @Field(() => [PipelineProgressWhereInput], { nullable: true })
  OR?: Array<PipelineProgressWhereInput>;

  @Field(() => [PipelineProgressWhereInput], { nullable: true })
  NOT?: Array<PipelineProgressWhereInput>;

  @Field(() => StringFilter, { nullable: true })
  id?: StringFilter;

  @Field(() => DateTimeFilter, { nullable: true })
  createdAt?: DateTimeFilter;

  @Field(() => DateTimeFilter, { nullable: true })
  updatedAt?: DateTimeFilter;

  @Field(() => DateTimeNullableFilter, { nullable: true })
  deletedAt?: DateTimeNullableFilter;

  @Field(() => StringFilter, { nullable: true })
  pipelineId?: StringFilter;

  @Field(() => StringFilter, { nullable: true })
  pipelineStageId?: StringFilter;

  @Field(() => EnumPipelineProgressableTypeFilter, { nullable: true })
  progressableType?: EnumPipelineProgressableTypeFilter;

  @Field(() => StringFilter, { nullable: true })
  progressableId?: StringFilter;

  @HideField()
  workspaceId?: StringFilter;

  @Field(() => PipelineRelationFilter, { nullable: true })
  pipeline?: PipelineRelationFilter;

  @Field(() => PipelineStageRelationFilter, { nullable: true })
  pipelineStage?: PipelineStageRelationFilter;

  @HideField()
  workspace?: WorkspaceRelationFilter;
}
