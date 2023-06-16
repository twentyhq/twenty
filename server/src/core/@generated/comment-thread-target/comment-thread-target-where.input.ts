import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringFilter } from '../prisma/string-filter.input';
import { DateTimeFilter } from '../prisma/date-time-filter.input';
import { DateTimeNullableFilter } from '../prisma/date-time-nullable-filter.input';
import { EnumCommentableTypeFilter } from '../prisma/enum-commentable-type-filter.input';
import { CommentThreadRelationFilter } from '../comment-thread/comment-thread-relation-filter.input';

@InputType()
export class CommentThreadTargetWhereInput {

    @Field(() => [CommentThreadTargetWhereInput], {nullable:true})
    AND?: Array<CommentThreadTargetWhereInput>;

    @Field(() => [CommentThreadTargetWhereInput], {nullable:true})
    OR?: Array<CommentThreadTargetWhereInput>;

    @Field(() => [CommentThreadTargetWhereInput], {nullable:true})
    NOT?: Array<CommentThreadTargetWhereInput>;

    @Field(() => StringFilter, {nullable:true})
    id?: StringFilter;

    @Field(() => DateTimeFilter, {nullable:true})
    createdAt?: DateTimeFilter;

    @Field(() => DateTimeFilter, {nullable:true})
    updatedAt?: DateTimeFilter;

    @Field(() => DateTimeNullableFilter, {nullable:true})
    deletedAt?: DateTimeNullableFilter;

    @Field(() => StringFilter, {nullable:true})
    commentThreadId?: StringFilter;

    @Field(() => EnumCommentableTypeFilter, {nullable:true})
    commentableType?: EnumCommentableTypeFilter;

    @Field(() => StringFilter, {nullable:true})
    commentableId?: StringFilter;

    @Field(() => CommentThreadRelationFilter, {nullable:true})
    commentThread?: CommentThreadRelationFilter;
}
