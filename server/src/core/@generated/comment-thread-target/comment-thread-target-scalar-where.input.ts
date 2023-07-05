import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringFilter } from '../prisma/string-filter.input';
import { EnumCommentableTypeFilter } from '../prisma/enum-commentable-type-filter.input';
import { DateTimeNullableFilter } from '../prisma/date-time-nullable-filter.input';
import { HideField } from '@nestjs/graphql';
import { DateTimeFilter } from '../prisma/date-time-filter.input';

@InputType()
export class CommentThreadTargetScalarWhereInput {

    @Field(() => [CommentThreadTargetScalarWhereInput], {nullable:true})
    AND?: Array<CommentThreadTargetScalarWhereInput>;

    @Field(() => [CommentThreadTargetScalarWhereInput], {nullable:true})
    OR?: Array<CommentThreadTargetScalarWhereInput>;

    @Field(() => [CommentThreadTargetScalarWhereInput], {nullable:true})
    NOT?: Array<CommentThreadTargetScalarWhereInput>;

    @Field(() => StringFilter, {nullable:true})
    id?: StringFilter;

    @Field(() => StringFilter, {nullable:true})
    commentThreadId?: StringFilter;

    @Field(() => EnumCommentableTypeFilter, {nullable:true})
    commentableType?: EnumCommentableTypeFilter;

    @Field(() => StringFilter, {nullable:true})
    commentableId?: StringFilter;

    @HideField()
    deletedAt?: DateTimeNullableFilter;

    @Field(() => DateTimeFilter, {nullable:true})
    createdAt?: DateTimeFilter;

    @Field(() => DateTimeFilter, {nullable:true})
    updatedAt?: DateTimeFilter;
}
