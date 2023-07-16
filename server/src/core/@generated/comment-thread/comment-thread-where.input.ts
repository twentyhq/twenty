import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringFilter } from '../prisma/string-filter.input';
import { HideField } from '@nestjs/graphql';
import { StringNullableFilter } from '../prisma/string-nullable-filter.input';
import { EnumActivityTypeFilter } from '../prisma/enum-activity-type-filter.input';
import { DateTimeNullableFilter } from '../prisma/date-time-nullable-filter.input';
import { DateTimeFilter } from '../prisma/date-time-filter.input';
import { CommentThreadTargetListRelationFilter } from '../comment-thread-target/comment-thread-target-list-relation-filter.input';
import { CommentListRelationFilter } from '../comment/comment-list-relation-filter.input';
import { WorkspaceRelationFilter } from '../workspace/workspace-relation-filter.input';
import { UserRelationFilter } from '../user/user-relation-filter.input';

@InputType()
export class CommentThreadWhereInput {

    @Field(() => [CommentThreadWhereInput], {nullable:true})
    AND?: Array<CommentThreadWhereInput>;

    @Field(() => [CommentThreadWhereInput], {nullable:true})
    OR?: Array<CommentThreadWhereInput>;

    @Field(() => [CommentThreadWhereInput], {nullable:true})
    NOT?: Array<CommentThreadWhereInput>;

    @Field(() => StringFilter, {nullable:true})
    id?: StringFilter;

    @HideField()
    workspaceId?: StringFilter;

    @Field(() => StringFilter, {nullable:true})
    authorId?: StringFilter;

    @Field(() => StringNullableFilter, {nullable:true})
    body?: StringNullableFilter;

    @Field(() => StringNullableFilter, {nullable:true})
    title?: StringNullableFilter;

    @Field(() => EnumActivityTypeFilter, {nullable:true})
    type?: EnumActivityTypeFilter;

    @Field(() => DateTimeNullableFilter, {nullable:true})
    reminderAt?: DateTimeNullableFilter;

    @Field(() => DateTimeNullableFilter, {nullable:true})
    dueAt?: DateTimeNullableFilter;

    @Field(() => DateTimeNullableFilter, {nullable:true})
    completedAt?: DateTimeNullableFilter;

    @Field(() => StringNullableFilter, {nullable:true})
    assigneeId?: StringNullableFilter;

    @HideField()
    deletedAt?: DateTimeNullableFilter;

    @Field(() => DateTimeFilter, {nullable:true})
    createdAt?: DateTimeFilter;

    @Field(() => DateTimeFilter, {nullable:true})
    updatedAt?: DateTimeFilter;

    @Field(() => CommentThreadTargetListRelationFilter, {nullable:true})
    commentThreadTargets?: CommentThreadTargetListRelationFilter;

    @Field(() => CommentListRelationFilter, {nullable:true})
    comments?: CommentListRelationFilter;

    @HideField()
    workspace?: WorkspaceRelationFilter;

    @Field(() => UserRelationFilter, {nullable:true})
    author?: UserRelationFilter;

    @Field(() => UserRelationFilter, {nullable:true})
    assignee?: UserRelationFilter;
}
