import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringWithAggregatesFilter } from '../prisma/string-with-aggregates-filter.input';
import { DateTimeWithAggregatesFilter } from '../prisma/date-time-with-aggregates-filter.input';
import { DateTimeNullableWithAggregatesFilter } from '../prisma/date-time-nullable-with-aggregates-filter.input';
import { HideField } from '@nestjs/graphql';

@InputType()
export class PipelineStageScalarWhereWithAggregatesInput {
  @Field(() => [PipelineStageScalarWhereWithAggregatesInput], {
    nullable: true,
  })
  AND?: Array<PipelineStageScalarWhereWithAggregatesInput>;

  @Field(() => [PipelineStageScalarWhereWithAggregatesInput], {
    nullable: true,
  })
  OR?: Array<PipelineStageScalarWhereWithAggregatesInput>;

  @Field(() => [PipelineStageScalarWhereWithAggregatesInput], {
    nullable: true,
  })
  NOT?: Array<PipelineStageScalarWhereWithAggregatesInput>;

  @Field(() => StringWithAggregatesFilter, { nullable: true })
  id?: StringWithAggregatesFilter;

  @Field(() => DateTimeWithAggregatesFilter, { nullable: true })
  createdAt?: DateTimeWithAggregatesFilter;

  @Field(() => DateTimeWithAggregatesFilter, { nullable: true })
  updatedAt?: DateTimeWithAggregatesFilter;

  @Field(() => DateTimeNullableWithAggregatesFilter, { nullable: true })
  deletedAt?: DateTimeNullableWithAggregatesFilter;

  @Field(() => StringWithAggregatesFilter, { nullable: true })
  name?: StringWithAggregatesFilter;

  @Field(() => StringWithAggregatesFilter, { nullable: true })
  type?: StringWithAggregatesFilter;

  @Field(() => StringWithAggregatesFilter, { nullable: true })
  color?: StringWithAggregatesFilter;

  @Field(() => StringWithAggregatesFilter, { nullable: true })
  pipelineId?: StringWithAggregatesFilter;

  @HideField()
  workspaceId?: StringWithAggregatesFilter;
}
