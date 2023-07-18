import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringWithAggregatesFilter } from '../prisma/string-with-aggregates-filter.input';
import { EnumColorSchemeWithAggregatesFilter } from '../prisma/enum-color-scheme-with-aggregates-filter.input';
import { DateTimeWithAggregatesFilter } from '../prisma/date-time-with-aggregates-filter.input';

@InputType()
export class UserSettingsScalarWhereWithAggregatesInput {

    @Field(() => [UserSettingsScalarWhereWithAggregatesInput], {nullable:true})
    AND?: Array<UserSettingsScalarWhereWithAggregatesInput>;

    @Field(() => [UserSettingsScalarWhereWithAggregatesInput], {nullable:true})
    OR?: Array<UserSettingsScalarWhereWithAggregatesInput>;

    @Field(() => [UserSettingsScalarWhereWithAggregatesInput], {nullable:true})
    NOT?: Array<UserSettingsScalarWhereWithAggregatesInput>;

    @Field(() => StringWithAggregatesFilter, {nullable:true})
    id?: StringWithAggregatesFilter;

    @Field(() => EnumColorSchemeWithAggregatesFilter, {nullable:true})
    colorScheme?: EnumColorSchemeWithAggregatesFilter;

    @Field(() => StringWithAggregatesFilter, {nullable:true})
    locale?: StringWithAggregatesFilter;

    @Field(() => DateTimeWithAggregatesFilter, {nullable:true})
    createdAt?: DateTimeWithAggregatesFilter;

    @Field(() => DateTimeWithAggregatesFilter, {nullable:true})
    updatedAt?: DateTimeWithAggregatesFilter;
}
