import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringFilter } from '../prisma/string-filter.input';
import { HideField } from '@nestjs/graphql';
import { DateTimeNullableFilter } from '../prisma/date-time-nullable-filter.input';
import { DateTimeFilter } from '../prisma/date-time-filter.input';

@InputType()
export class CommentThreadScalarWhereInput {

    @Field(() => [CommentThreadScalarWhereInput], {nullable:true})
    AND?: Array<CommentThreadScalarWhereInput>;

    @Field(() => [CommentThreadScalarWhereInput], {nullable:true})
    OR?: Array<CommentThreadScalarWhereInput>;

    @Field(() => [CommentThreadScalarWhereInput], {nullable:true})
    NOT?: Array<CommentThreadScalarWhereInput>;

    @Field(() => StringFilter, {nullable:true})
    id?: StringFilter;

    @HideField()
    workspaceId?: StringFilter;

    @HideField()
    deletedAt?: DateTimeNullableFilter;

    @Field(() => DateTimeFilter, {nullable:true})
    createdAt?: DateTimeFilter;

    @Field(() => DateTimeFilter, {nullable:true})
    updatedAt?: DateTimeFilter;
}
