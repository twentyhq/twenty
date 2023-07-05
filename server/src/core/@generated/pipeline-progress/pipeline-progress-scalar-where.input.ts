import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringFilter } from '../prisma/string-filter.input';
import { EnumPipelineProgressableTypeFilter } from '../prisma/enum-pipeline-progressable-type-filter.input';
import { HideField } from '@nestjs/graphql';
import { DateTimeNullableFilter } from '../prisma/date-time-nullable-filter.input';
import { DateTimeFilter } from '../prisma/date-time-filter.input';

@InputType()
export class PipelineProgressScalarWhereInput {

    @Field(() => [PipelineProgressScalarWhereInput], {nullable:true})
    AND?: Array<PipelineProgressScalarWhereInput>;

    @Field(() => [PipelineProgressScalarWhereInput], {nullable:true})
    OR?: Array<PipelineProgressScalarWhereInput>;

    @Field(() => [PipelineProgressScalarWhereInput], {nullable:true})
    NOT?: Array<PipelineProgressScalarWhereInput>;

    @Field(() => StringFilter, {nullable:true})
    id?: StringFilter;

    @Field(() => StringFilter, {nullable:true})
    pipelineId?: StringFilter;

    @Field(() => StringFilter, {nullable:true})
    pipelineStageId?: StringFilter;

    @Field(() => EnumPipelineProgressableTypeFilter, {nullable:true})
    progressableType?: EnumPipelineProgressableTypeFilter;

    @Field(() => StringFilter, {nullable:true})
    progressableId?: StringFilter;

    @HideField()
    workspaceId?: StringFilter;

    @HideField()
    deletedAt?: DateTimeNullableFilter;

    @Field(() => DateTimeFilter, {nullable:true})
    createdAt?: DateTimeFilter;

    @Field(() => DateTimeFilter, {nullable:true})
    updatedAt?: DateTimeFilter;
}
