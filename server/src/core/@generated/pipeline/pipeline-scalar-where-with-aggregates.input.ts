import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringWithAggregatesFilter } from '../prisma/string-with-aggregates-filter.input';
import { EnumPipelineProgressableTypeWithAggregatesFilter } from '../prisma/enum-pipeline-progressable-type-with-aggregates-filter.input';
import { HideField } from '@nestjs/graphql';
import { DateTimeNullableWithAggregatesFilter } from '../prisma/date-time-nullable-with-aggregates-filter.input';
import { DateTimeWithAggregatesFilter } from '../prisma/date-time-with-aggregates-filter.input';

@InputType()
export class PipelineScalarWhereWithAggregatesInput {

    @Field(() => [PipelineScalarWhereWithAggregatesInput], {nullable:true})
    AND?: Array<PipelineScalarWhereWithAggregatesInput>;

    @Field(() => [PipelineScalarWhereWithAggregatesInput], {nullable:true})
    OR?: Array<PipelineScalarWhereWithAggregatesInput>;

    @Field(() => [PipelineScalarWhereWithAggregatesInput], {nullable:true})
    NOT?: Array<PipelineScalarWhereWithAggregatesInput>;

    @Field(() => StringWithAggregatesFilter, {nullable:true})
    id?: StringWithAggregatesFilter;

    @Field(() => StringWithAggregatesFilter, {nullable:true})
    name?: StringWithAggregatesFilter;

    @Field(() => StringWithAggregatesFilter, {nullable:true})
    icon?: StringWithAggregatesFilter;

    @Field(() => EnumPipelineProgressableTypeWithAggregatesFilter, {nullable:true})
    pipelineProgressableType?: EnumPipelineProgressableTypeWithAggregatesFilter;

    @HideField()
    workspaceId?: StringWithAggregatesFilter;

    @HideField()
    deletedAt?: DateTimeNullableWithAggregatesFilter;

    @Field(() => DateTimeWithAggregatesFilter, {nullable:true})
    createdAt?: DateTimeWithAggregatesFilter;

    @Field(() => DateTimeWithAggregatesFilter, {nullable:true})
    updatedAt?: DateTimeWithAggregatesFilter;
}
