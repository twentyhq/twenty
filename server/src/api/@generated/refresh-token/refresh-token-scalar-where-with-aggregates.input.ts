import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringWithAggregatesFilter } from '../prisma/string-with-aggregates-filter.input';
import { DateTimeWithAggregatesFilter } from '../prisma/date-time-with-aggregates-filter.input';
import { DateTimeNullableWithAggregatesFilter } from '../prisma/date-time-nullable-with-aggregates-filter.input';

@InputType()
export class RefreshTokenScalarWhereWithAggregatesInput {

    @Field(() => [RefreshTokenScalarWhereWithAggregatesInput], {nullable:true})
    AND?: Array<RefreshTokenScalarWhereWithAggregatesInput>;

    @Field(() => [RefreshTokenScalarWhereWithAggregatesInput], {nullable:true})
    OR?: Array<RefreshTokenScalarWhereWithAggregatesInput>;

    @Field(() => [RefreshTokenScalarWhereWithAggregatesInput], {nullable:true})
    NOT?: Array<RefreshTokenScalarWhereWithAggregatesInput>;

    @Field(() => StringWithAggregatesFilter, {nullable:true})
    id?: StringWithAggregatesFilter;

    @Field(() => DateTimeWithAggregatesFilter, {nullable:true})
    createdAt?: DateTimeWithAggregatesFilter;

    @Field(() => DateTimeWithAggregatesFilter, {nullable:true})
    updatedAt?: DateTimeWithAggregatesFilter;

    @Field(() => DateTimeNullableWithAggregatesFilter, {nullable:true})
    deletedAt?: DateTimeNullableWithAggregatesFilter;

    @Field(() => StringWithAggregatesFilter, {nullable:true})
    refreshToken?: StringWithAggregatesFilter;

    @Field(() => StringWithAggregatesFilter, {nullable:true})
    userId?: StringWithAggregatesFilter;
}
