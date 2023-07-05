import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringWithAggregatesFilter } from '../prisma/string-with-aggregates-filter.input';
import { HideField } from '@nestjs/graphql';
import { DateTimeNullableWithAggregatesFilter } from '../prisma/date-time-nullable-with-aggregates-filter.input';
import { DateTimeWithAggregatesFilter } from '../prisma/date-time-with-aggregates-filter.input';

@InputType()
export class WorkspaceMemberScalarWhereWithAggregatesInput {

    @Field(() => [WorkspaceMemberScalarWhereWithAggregatesInput], {nullable:true})
    AND?: Array<WorkspaceMemberScalarWhereWithAggregatesInput>;

    @Field(() => [WorkspaceMemberScalarWhereWithAggregatesInput], {nullable:true})
    OR?: Array<WorkspaceMemberScalarWhereWithAggregatesInput>;

    @Field(() => [WorkspaceMemberScalarWhereWithAggregatesInput], {nullable:true})
    NOT?: Array<WorkspaceMemberScalarWhereWithAggregatesInput>;

    @Field(() => StringWithAggregatesFilter, {nullable:true})
    id?: StringWithAggregatesFilter;

    @Field(() => StringWithAggregatesFilter, {nullable:true})
    userId?: StringWithAggregatesFilter;

    @HideField()
    workspaceId?: StringWithAggregatesFilter;

    @HideField()
    deletedAt?: DateTimeNullableWithAggregatesFilter;

    @Field(() => DateTimeWithAggregatesFilter, {nullable:true})
    createdAt?: DateTimeWithAggregatesFilter;

    @Field(() => DateTimeWithAggregatesFilter, {nullable:true})
    updatedAt?: DateTimeWithAggregatesFilter;
}
