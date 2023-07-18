import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringFilter } from '../prisma/string-filter.input';
import { EnumColorSchemeFilter } from '../prisma/enum-color-scheme-filter.input';
import { DateTimeFilter } from '../prisma/date-time-filter.input';
import { UserRelationFilter } from '../user/user-relation-filter.input';

@InputType()
export class UserSettingsWhereInput {

    @Field(() => [UserSettingsWhereInput], {nullable:true})
    AND?: Array<UserSettingsWhereInput>;

    @Field(() => [UserSettingsWhereInput], {nullable:true})
    OR?: Array<UserSettingsWhereInput>;

    @Field(() => [UserSettingsWhereInput], {nullable:true})
    NOT?: Array<UserSettingsWhereInput>;

    @Field(() => StringFilter, {nullable:true})
    id?: StringFilter;

    @Field(() => EnumColorSchemeFilter, {nullable:true})
    colorScheme?: EnumColorSchemeFilter;

    @Field(() => StringFilter, {nullable:true})
    locale?: StringFilter;

    @Field(() => DateTimeFilter, {nullable:true})
    createdAt?: DateTimeFilter;

    @Field(() => DateTimeFilter, {nullable:true})
    updatedAt?: DateTimeFilter;

    @Field(() => UserRelationFilter, {nullable:true})
    user?: UserRelationFilter;
}
