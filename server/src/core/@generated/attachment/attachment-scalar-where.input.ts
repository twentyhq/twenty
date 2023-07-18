import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringFilter } from '../prisma/string-filter.input';
import { EnumAttachmentTypeFilter } from '../prisma/enum-attachment-type-filter.input';
import { HideField } from '@nestjs/graphql';
import { DateTimeNullableFilter } from '../prisma/date-time-nullable-filter.input';
import { DateTimeFilter } from '../prisma/date-time-filter.input';

@InputType()
export class AttachmentScalarWhereInput {

    @Field(() => [AttachmentScalarWhereInput], {nullable:true})
    AND?: Array<AttachmentScalarWhereInput>;

    @Field(() => [AttachmentScalarWhereInput], {nullable:true})
    OR?: Array<AttachmentScalarWhereInput>;

    @Field(() => [AttachmentScalarWhereInput], {nullable:true})
    NOT?: Array<AttachmentScalarWhereInput>;

    @Field(() => StringFilter, {nullable:true})
    id?: StringFilter;

    @Field(() => StringFilter, {nullable:true})
    fullPath?: StringFilter;

    @Field(() => EnumAttachmentTypeFilter, {nullable:true})
    type?: EnumAttachmentTypeFilter;

    @Field(() => StringFilter, {nullable:true})
    name?: StringFilter;

    @Field(() => StringFilter, {nullable:true})
    authorId?: StringFilter;

    @Field(() => StringFilter, {nullable:true})
    activityId?: StringFilter;

    @HideField()
    workspaceId?: StringFilter;

    @HideField()
    deletedAt?: DateTimeNullableFilter;

    @Field(() => DateTimeFilter, {nullable:true})
    createdAt?: DateTimeFilter;

    @Field(() => DateTimeFilter, {nullable:true})
    updatedAt?: DateTimeFilter;
}
