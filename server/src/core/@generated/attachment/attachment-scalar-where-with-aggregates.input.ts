import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringWithAggregatesFilter } from '../prisma/string-with-aggregates-filter.input';
import { EnumAttachmentTypeWithAggregatesFilter } from '../prisma/enum-attachment-type-with-aggregates-filter.input';
import { HideField } from '@nestjs/graphql';
import { DateTimeNullableWithAggregatesFilter } from '../prisma/date-time-nullable-with-aggregates-filter.input';
import { DateTimeWithAggregatesFilter } from '../prisma/date-time-with-aggregates-filter.input';

@InputType()
export class AttachmentScalarWhereWithAggregatesInput {

    @Field(() => [AttachmentScalarWhereWithAggregatesInput], {nullable:true})
    AND?: Array<AttachmentScalarWhereWithAggregatesInput>;

    @Field(() => [AttachmentScalarWhereWithAggregatesInput], {nullable:true})
    OR?: Array<AttachmentScalarWhereWithAggregatesInput>;

    @Field(() => [AttachmentScalarWhereWithAggregatesInput], {nullable:true})
    NOT?: Array<AttachmentScalarWhereWithAggregatesInput>;

    @Field(() => StringWithAggregatesFilter, {nullable:true})
    id?: StringWithAggregatesFilter;

    @Field(() => StringWithAggregatesFilter, {nullable:true})
    fullPath?: StringWithAggregatesFilter;

    @Field(() => EnumAttachmentTypeWithAggregatesFilter, {nullable:true})
    type?: EnumAttachmentTypeWithAggregatesFilter;

    @Field(() => StringWithAggregatesFilter, {nullable:true})
    name?: StringWithAggregatesFilter;

    @Field(() => StringWithAggregatesFilter, {nullable:true})
    authorId?: StringWithAggregatesFilter;

    @Field(() => StringWithAggregatesFilter, {nullable:true})
    activityId?: StringWithAggregatesFilter;

    @HideField()
    workspaceId?: StringWithAggregatesFilter;

    @HideField()
    deletedAt?: DateTimeNullableWithAggregatesFilter;

    @Field(() => DateTimeWithAggregatesFilter, {nullable:true})
    createdAt?: DateTimeWithAggregatesFilter;

    @Field(() => DateTimeWithAggregatesFilter, {nullable:true})
    updatedAt?: DateTimeWithAggregatesFilter;
}
