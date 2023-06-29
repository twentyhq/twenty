import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringFilter } from '../prisma/string-filter.input';
import { HideField } from '@nestjs/graphql';
import { DateTimeNullableFilter } from '../prisma/date-time-nullable-filter.input';
import { DateTimeFilter } from '../prisma/date-time-filter.input';

@InputType()
export class PipelineStageScalarWhereInput {

    @Field(() => [PipelineStageScalarWhereInput], {nullable:true})
    AND?: Array<PipelineStageScalarWhereInput>;

    @Field(() => [PipelineStageScalarWhereInput], {nullable:true})
    OR?: Array<PipelineStageScalarWhereInput>;

    @Field(() => [PipelineStageScalarWhereInput], {nullable:true})
    NOT?: Array<PipelineStageScalarWhereInput>;

    @Field(() => StringFilter, {nullable:true})
    id?: StringFilter;

    @Field(() => StringFilter, {nullable:true})
    name?: StringFilter;

    @Field(() => StringFilter, {nullable:true})
    type?: StringFilter;

    @Field(() => StringFilter, {nullable:true})
    color?: StringFilter;

    @Field(() => StringFilter, {nullable:true})
    pipelineId?: StringFilter;

    @HideField()
    workspaceId?: StringFilter;

    @HideField()
    deletedAt?: DateTimeNullableFilter;

    @Field(() => DateTimeFilter, {nullable:true})
    createdAt?: DateTimeFilter;

    @Field(() => DateTimeFilter, {nullable:true})
    updatedAt?: DateTimeFilter;
}
