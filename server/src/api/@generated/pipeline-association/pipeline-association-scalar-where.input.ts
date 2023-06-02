import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringFilter } from '../prisma/string-filter.input';
import { DateTimeFilter } from '../prisma/date-time-filter.input';
import { DateTimeNullableFilter } from '../prisma/date-time-nullable-filter.input';
import { EnumPipelineAssociableTypeFilter } from '../prisma/enum-pipeline-associable-type-filter.input';

@InputType()
export class PipelineAssociationScalarWhereInput {
  @Field(() => [PipelineAssociationScalarWhereInput], { nullable: true })
  AND?: Array<PipelineAssociationScalarWhereInput>;

  @Field(() => [PipelineAssociationScalarWhereInput], { nullable: true })
  OR?: Array<PipelineAssociationScalarWhereInput>;

  @Field(() => [PipelineAssociationScalarWhereInput], { nullable: true })
  NOT?: Array<PipelineAssociationScalarWhereInput>;

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
}
