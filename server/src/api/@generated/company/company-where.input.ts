import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringFilter } from '../prisma/string-filter.input';
import { DateTimeFilter } from '../prisma/date-time-filter.input';
import { DateTimeNullableFilter } from '../prisma/date-time-nullable-filter.input';
import { IntNullableFilter } from '../prisma/int-nullable-filter.input';
import { StringNullableFilter } from '../prisma/string-nullable-filter.input';
import { HideField } from '@nestjs/graphql';
import { UserRelationFilter } from '../user/user-relation-filter.input';
import { PersonListRelationFilter } from '../person/person-list-relation-filter.input';
import { WorkspaceRelationFilter } from '../workspace/workspace-relation-filter.input';

@InputType()
export class CompanyWhereInput {

    @Field(() => [CompanyWhereInput], {nullable:true})
    AND?: Array<CompanyWhereInput>;

    @Field(() => [CompanyWhereInput], {nullable:true})
    OR?: Array<CompanyWhereInput>;

    @Field(() => [CompanyWhereInput], {nullable:true})
    NOT?: Array<CompanyWhereInput>;

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

    @Field(() => UserRelationFilter, {nullable:true})
    accountOwner?: UserRelationFilter;

    @Field(() => PersonListRelationFilter, {nullable:true})
    people?: PersonListRelationFilter;

    @HideField()
    workspace?: WorkspaceRelationFilter;
}
