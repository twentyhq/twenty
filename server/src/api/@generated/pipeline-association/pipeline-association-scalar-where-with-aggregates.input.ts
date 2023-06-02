import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringWithAggregatesFilter } from '../prisma/string-with-aggregates-filter.input';
import { DateTimeWithAggregatesFilter } from '../prisma/date-time-with-aggregates-filter.input';
import { DateTimeNullableWithAggregatesFilter } from '../prisma/date-time-nullable-with-aggregates-filter.input';
import { EnumPipelineAssociableTypeWithAggregatesFilter } from '../prisma/enum-pipeline-associable-type-with-aggregates-filter.input';

@InputType()
export class PipelineAssociationScalarWhereWithAggregatesInput {
  @Field(() => [PipelineAssociationScalarWhereWithAggregatesInput], {
    nullable: true,
  })
  AND?: Array<PipelineAssociationScalarWhereWithAggregatesInput>;

  @Field(() => [PipelineAssociationScalarWhereWithAggregatesInput], {
    nullable: true,
  })
  OR?: Array<PipelineAssociationScalarWhereWithAggregatesInput>;

  @Field(() => [PipelineAssociationScalarWhereWithAggregatesInput], {
    nullable: true,
  })
  NOT?: Array<PipelineAssociationScalarWhereWithAggregatesInput>;

  @Field(() => StringWithAggregatesFilter, { nullable: true })
  id?: StringWithAggregatesFilter;

  @Field(() => DateTimeWithAggregatesFilter, { nullable: true })
  createdAt?: DateTimeWithAggregatesFilter;

  @Field(() => DateTimeWithAggregatesFilter, { nullable: true })
  updatedAt?: DateTimeWithAggregatesFilter;

  @Field(() => DateTimeNullableWithAggregatesFilter, { nullable: true })
  deletedAt?: DateTimeNullableWithAggregatesFilter;

  @Field(() => StringWithAggregatesFilter, { nullable: true })
  pipelineId?: StringWithAggregatesFilter;

  @Field(() => StringWithAggregatesFilter, { nullable: true })
  pipelineStageId?: StringWithAggregatesFilter;

  @Field(() => EnumPipelineAssociableTypeWithAggregatesFilter, {
    nullable: true,
  })
  associableType?: EnumPipelineAssociableTypeWithAggregatesFilter;

  @Field(() => StringWithAggregatesFilter, { nullable: true })
  associableId?: StringWithAggregatesFilter;
}
