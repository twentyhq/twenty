import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringWithAggregatesFilter } from '../prisma/string-with-aggregates-filter.input';
import { DateTimeWithAggregatesFilter } from '../prisma/date-time-with-aggregates-filter.input';
import { BoolWithAggregatesFilter } from '../prisma/bool-with-aggregates-filter.input';
import { DateTimeNullableWithAggregatesFilter } from '../prisma/date-time-nullable-with-aggregates-filter.input';
import { HideField } from '@nestjs/graphql';

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

    @Field(() => BoolWithAggregatesFilter, {nullable:true})
    isRevoked?: BoolWithAggregatesFilter;

    @Field(() => DateTimeWithAggregatesFilter, {nullable:true})
    expiresAt?: DateTimeWithAggregatesFilter;

    @Field(() => DateTimeNullableWithAggregatesFilter, {nullable:true})
    deletedAt?: DateTimeNullableWithAggregatesFilter;

    @HideField()
    userId?: StringWithAggregatesFilter;
}
