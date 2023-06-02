import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringFilter } from '../prisma/string-filter.input';
import { DateTimeFilter } from '../prisma/date-time-filter.input';
import { DateTimeNullableFilter } from '../prisma/date-time-nullable-filter.input';
import { EnumPipelineAssociableTypeFilter } from '../prisma/enum-pipeline-associable-type-filter.input';
import { PipelineRelationFilter } from '../pipeline/pipeline-relation-filter.input';
import { PipelineStageRelationFilter } from '../pipeline-stage/pipeline-stage-relation-filter.input';

@InputType()
export class PipelineAssociationWhereInput {
  @Field(() => [PipelineAssociationWhereInput], { nullable: true })
  AND?: Array<PipelineAssociationWhereInput>;

  @Field(() => [PipelineAssociationWhereInput], { nullable: true })
  OR?: Array<PipelineAssociationWhereInput>;

  @Field(() => [PipelineAssociationWhereInput], { nullable: true })
  NOT?: Array<PipelineAssociationWhereInput>;

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

  @Field(() => EnumPipelineAssociableTypeFilter, { nullable: true })
  associableType?: EnumPipelineAssociableTypeFilter;

  @Field(() => StringFilter, { nullable: true })
  associableId?: StringFilter;

  @Field(() => PipelineRelationFilter, { nullable: true })
  pipeline?: PipelineRelationFilter;

  @Field(() => PipelineStageRelationFilter, { nullable: true })
  pipelineStage?: PipelineStageRelationFilter;
}
