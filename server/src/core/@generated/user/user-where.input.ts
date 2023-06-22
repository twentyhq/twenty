import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringFilter } from '../prisma/string-filter.input';
import { DateTimeFilter } from '../prisma/date-time-filter.input';
import { DateTimeNullableFilter } from '../prisma/date-time-nullable-filter.input';
import { BoolFilter } from '../prisma/bool-filter.input';
import { StringNullableFilter } from '../prisma/string-nullable-filter.input';
import { HideField } from '@nestjs/graphql';
import { JsonNullableFilter } from '../prisma/json-nullable-filter.input';
import { WorkspaceMemberRelationFilter } from '../workspace-member/workspace-member-relation-filter.input';
import { CompanyListRelationFilter } from '../company/company-list-relation-filter.input';
import { RefreshTokenListRelationFilter } from '../refresh-token/refresh-token-list-relation-filter.input';
import { CommentListRelationFilter } from '../comment/comment-list-relation-filter.input';

@InputType()
export class UserWhereInput {

    @Field(() => [UserWhereInput], {nullable:true})
    AND?: Array<UserWhereInput>;

    @Field(() => [UserWhereInput], {nullable:true})
    OR?: Array<UserWhereInput>;

    @Field(() => [UserWhereInput], {nullable:true})
    NOT?: Array<UserWhereInput>;

    @Field(() => StringFilter, {nullable:true})
    id?: StringFilter;

    @Field(() => DateTimeFilter, {nullable:true})
    createdAt?: DateTimeFilter;

    @Field(() => DateTimeFilter, {nullable:true})
    updatedAt?: DateTimeFilter;

    @Field(() => DateTimeNullableFilter, {nullable:true})
    deletedAt?: DateTimeNullableFilter;

    @Field(() => DateTimeNullableFilter, {nullable:true})
    lastSeen?: DateTimeNullableFilter;

    @Field(() => BoolFilter, {nullable:true})
    disabled?: BoolFilter;

    @Field(() => StringFilter, {nullable:true})
    displayName?: StringFilter;

    @Field(() => StringFilter, {nullable:true})
    email?: StringFilter;

    @Field(() => StringNullableFilter, {nullable:true})
    avatarUrl?: StringNullableFilter;

    @Field(() => StringFilter, {nullable:true})
    locale?: StringFilter;

    @Field(() => StringNullableFilter, {nullable:true})
    phoneNumber?: StringNullableFilter;

    @HideField()
    passwordHash?: StringNullableFilter;

    @Field(() => BoolFilter, {nullable:true})
    emailVerified?: BoolFilter;

    @Field(() => JsonNullableFilter, {nullable:true})
    metadata?: JsonNullableFilter;

    @HideField()
    workspaceMember?: WorkspaceMemberRelationFilter;

    @Field(() => CompanyListRelationFilter, {nullable:true})
    companies?: CompanyListRelationFilter;

    @HideField()
    refreshTokens?: RefreshTokenListRelationFilter;

    @Field(() => CommentListRelationFilter, {nullable:true})
    comments?: CommentListRelationFilter;
}
