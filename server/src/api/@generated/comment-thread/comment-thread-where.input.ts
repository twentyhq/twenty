import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringFilter } from '../prisma/string-filter.input';
import { DateTimeFilter } from '../prisma/date-time-filter.input';
import { DateTimeNullableFilter } from '../prisma/date-time-nullable-filter.input';
import { HideField } from '@nestjs/graphql';
import { CommentThreadTargetListRelationFilter } from '../comment-thread-target/comment-thread-target-list-relation-filter.input';
import { CommentListRelationFilter } from '../comment/comment-list-relation-filter.input';
import { WorkspaceRelationFilter } from '../workspace/workspace-relation-filter.input';

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

    @Field(() => DateTimeFilter, {nullable:true})
    createdAt?: DateTimeFilter;

    @Field(() => DateTimeFilter, {nullable:true})
    updatedAt?: DateTimeFilter;

    @Field(() => DateTimeNullableFilter, {nullable:true})
    deletedAt?: DateTimeNullableFilter;

    @HideField()
    workspaceId?: StringFilter;

    @Field(() => CommentThreadTargetListRelationFilter, {nullable:true})
    commentThreadTargets?: CommentThreadTargetListRelationFilter;

    @Field(() => CommentListRelationFilter, {nullable:true})
    comments?: CommentListRelationFilter;

    @HideField()
    workspace?: WorkspaceRelationFilter;
}
