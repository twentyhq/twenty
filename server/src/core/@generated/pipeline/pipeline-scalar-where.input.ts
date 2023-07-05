import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringFilter } from '../prisma/string-filter.input';
import { EnumPipelineProgressableTypeFilter } from '../prisma/enum-pipeline-progressable-type-filter.input';
import { HideField } from '@nestjs/graphql';
import { DateTimeNullableFilter } from '../prisma/date-time-nullable-filter.input';
import { DateTimeFilter } from '../prisma/date-time-filter.input';

@InputType()
export class PipelineScalarWhereInput {

    @Field(() => [PipelineScalarWhereInput], {nullable:true})
    AND?: Array<PipelineScalarWhereInput>;

    @Field(() => [PipelineScalarWhereInput], {nullable:true})
    OR?: Array<PipelineScalarWhereInput>;

    @Field(() => [PipelineScalarWhereInput], {nullable:true})
    NOT?: Array<PipelineScalarWhereInput>;

    @Field(() => StringFilter, {nullable:true})
    id?: StringFilter;

    @Field(() => StringFilter, {nullable:true})
    name?: StringFilter;

    @Field(() => StringFilter, {nullable:true})
    icon?: StringFilter;

    @Field(() => EnumPipelineProgressableTypeFilter, {nullable:true})
    pipelineProgressableType?: EnumPipelineProgressableTypeFilter;

    @HideField()
    workspaceId?: StringFilter;

    @HideField()
    deletedAt?: DateTimeNullableFilter;

    @Field(() => DateTimeFilter, {nullable:true})
    createdAt?: DateTimeFilter;

    @Field(() => DateTimeFilter, {nullable:true})
    updatedAt?: DateTimeFilter;
}
