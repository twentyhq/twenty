import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringFilter } from '../prisma/string-filter.input';
import { DateTimeFilter } from '../prisma/date-time-filter.input';
import { DateTimeNullableFilter } from '../prisma/date-time-nullable-filter.input';
import { IntNullableFilter } from '../prisma/int-nullable-filter.input';
import { StringNullableFilter } from '../prisma/string-nullable-filter.input';
import { HideField } from '@nestjs/graphql';

@InputType()
export class CompanyScalarWhereInput {

    @Field(() => [CompanyScalarWhereInput], {nullable:true})
    AND?: Array<CompanyScalarWhereInput>;

    @Field(() => [CompanyScalarWhereInput], {nullable:true})
    OR?: Array<CompanyScalarWhereInput>;

    @Field(() => [CompanyScalarWhereInput], {nullable:true})
    NOT?: Array<CompanyScalarWhereInput>;

    @Field(() => StringFilter, {nullable:true})
    id?: StringFilter;

    @Field(() => DateTimeFilter, {nullable:true})
    createdAt?: DateTimeFilter;

    @Field(() => DateTimeFilter, {nullable:true})
    updatedAt?: DateTimeFilter;

    @Field(() => DateTimeNullableFilter, {nullable:true})
    deletedAt?: DateTimeNullableFilter;

    @Field(() => StringFilter, {nullable:true})
    name?: StringFilter;

    @Field(() => StringFilter, {nullable:true})
    domainName?: StringFilter;

    @Field(() => StringFilter, {nullable:true})
    address?: StringFilter;

    @Field(() => IntNullableFilter, {nullable:true})
    employees?: IntNullableFilter;

    @Field(() => StringNullableFilter, {nullable:true})
    accountOwnerId?: StringNullableFilter;

    @HideField()
    workspaceId?: StringFilter;
}
