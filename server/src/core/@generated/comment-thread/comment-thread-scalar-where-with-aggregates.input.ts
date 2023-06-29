import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringWithAggregatesFilter } from '../prisma/string-with-aggregates-filter.input';
import { HideField } from '@nestjs/graphql';
import { DateTimeNullableWithAggregatesFilter } from '../prisma/date-time-nullable-with-aggregates-filter.input';
import { DateTimeWithAggregatesFilter } from '../prisma/date-time-with-aggregates-filter.input';

@InputType()
export class CommentThreadScalarWhereWithAggregatesInput {

    @Field(() => [CommentThreadScalarWhereWithAggregatesInput], {nullable:true})
    AND?: Array<CommentThreadScalarWhereWithAggregatesInput>;

    @Field(() => [CommentThreadScalarWhereWithAggregatesInput], {nullable:true})
    OR?: Array<CommentThreadScalarWhereWithAggregatesInput>;

    @Field(() => [CommentThreadScalarWhereWithAggregatesInput], {nullable:true})
    NOT?: Array<CommentThreadScalarWhereWithAggregatesInput>;

    @Field(() => StringWithAggregatesFilter, {nullable:true})
    id?: StringWithAggregatesFilter;

    @HideField()
    workspaceId?: StringWithAggregatesFilter;

    @HideField()
    deletedAt?: DateTimeNullableWithAggregatesFilter;

    @Field(() => DateTimeWithAggregatesFilter, {nullable:true})
    createdAt?: DateTimeWithAggregatesFilter;

    @Field(() => DateTimeWithAggregatesFilter, {nullable:true})
    updatedAt?: DateTimeWithAggregatesFilter;
}
