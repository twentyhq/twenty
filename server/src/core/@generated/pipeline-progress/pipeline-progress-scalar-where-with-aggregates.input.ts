import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringWithAggregatesFilter } from '../prisma/string-with-aggregates-filter.input';
import { IntNullableWithAggregatesFilter } from '../prisma/int-nullable-with-aggregates-filter.input';
import { DateTimeNullableWithAggregatesFilter } from '../prisma/date-time-nullable-with-aggregates-filter.input';
import { EnumPipelineProgressableTypeWithAggregatesFilter } from '../prisma/enum-pipeline-progressable-type-with-aggregates-filter.input';
import { HideField } from '@nestjs/graphql';
import { DateTimeWithAggregatesFilter } from '../prisma/date-time-with-aggregates-filter.input';

@InputType()
export class PipelineProgressScalarWhereWithAggregatesInput {

    @Field(() => [PipelineProgressScalarWhereWithAggregatesInput], {nullable:true})
    AND?: Array<PipelineProgressScalarWhereWithAggregatesInput>;

    @Field(() => [PipelineProgressScalarWhereWithAggregatesInput], {nullable:true})
    OR?: Array<PipelineProgressScalarWhereWithAggregatesInput>;

    @Field(() => [PipelineProgressScalarWhereWithAggregatesInput], {nullable:true})
    NOT?: Array<PipelineProgressScalarWhereWithAggregatesInput>;

    @Field(() => StringWithAggregatesFilter, {nullable:true})
    id?: StringWithAggregatesFilter;

    @Field(() => IntNullableWithAggregatesFilter, {nullable:true})
    amount?: IntNullableWithAggregatesFilter;

    @Field(() => DateTimeNullableWithAggregatesFilter, {nullable:true})
    closeDate?: DateTimeNullableWithAggregatesFilter;

    @Field(() => StringWithAggregatesFilter, {nullable:true})
    pipelineId?: StringWithAggregatesFilter;

    @Field(() => StringWithAggregatesFilter, {nullable:true})
    pipelineStageId?: StringWithAggregatesFilter;

    @Field(() => EnumPipelineProgressableTypeWithAggregatesFilter, {nullable:true})
    progressableType?: EnumPipelineProgressableTypeWithAggregatesFilter;

    @Field(() => StringWithAggregatesFilter, {nullable:true})
    progressableId?: StringWithAggregatesFilter;

    @HideField()
    workspaceId?: StringWithAggregatesFilter;

    @HideField()
    deletedAt?: DateTimeNullableWithAggregatesFilter;

    @Field(() => DateTimeWithAggregatesFilter, {nullable:true})
    createdAt?: DateTimeWithAggregatesFilter;

    @Field(() => DateTimeWithAggregatesFilter, {nullable:true})
    updatedAt?: DateTimeWithAggregatesFilter;
}
