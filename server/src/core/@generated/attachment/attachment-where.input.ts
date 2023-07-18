import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringFilter } from '../prisma/string-filter.input';
import { EnumAttachmentTypeFilter } from '../prisma/enum-attachment-type-filter.input';
import { HideField } from '@nestjs/graphql';
import { DateTimeNullableFilter } from '../prisma/date-time-nullable-filter.input';
import { DateTimeFilter } from '../prisma/date-time-filter.input';
import { UserRelationFilter } from '../user/user-relation-filter.input';
import { CommentThreadRelationFilter } from '../comment-thread/comment-thread-relation-filter.input';

@InputType()
export class AttachmentWhereInput {

    @Field(() => [AttachmentWhereInput], {nullable:true})
    AND?: Array<AttachmentWhereInput>;

    @Field(() => [AttachmentWhereInput], {nullable:true})
    OR?: Array<AttachmentWhereInput>;

    @Field(() => [AttachmentWhereInput], {nullable:true})
    NOT?: Array<AttachmentWhereInput>;

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

    @Field(() => UserRelationFilter, {nullable:true})
    author?: UserRelationFilter;

    @Field(() => CommentThreadRelationFilter, {nullable:true})
    activity?: CommentThreadRelationFilter;
}
