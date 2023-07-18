import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringFilter } from '../prisma/string-filter.input';
import { StringNullableFilter } from '../prisma/string-nullable-filter.input';
import { BoolFilter } from '../prisma/bool-filter.input';
import { DateTimeNullableFilter } from '../prisma/date-time-nullable-filter.input';
import { HideField } from '@nestjs/graphql';
import { JsonNullableFilter } from '../prisma/json-nullable-filter.input';
import { DateTimeFilter } from '../prisma/date-time-filter.input';
import { WorkspaceMemberRelationFilter } from '../workspace-member/workspace-member-relation-filter.input';
import { CompanyListRelationFilter } from '../company/company-list-relation-filter.input';
import { RefreshTokenListRelationFilter } from '../refresh-token/refresh-token-list-relation-filter.input';
import { CommentListRelationFilter } from '../comment/comment-list-relation-filter.input';
import { CommentThreadListRelationFilter } from '../comment-thread/comment-thread-list-relation-filter.input';
import { UserSettingsRelationFilter } from '../user-settings/user-settings-relation-filter.input';

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

    @Field(() => StringNullableFilter, {nullable:true})
    firstName?: StringNullableFilter;

    @Field(() => StringNullableFilter, {nullable:true})
    lastName?: StringNullableFilter;

    @Field(() => StringFilter, {nullable:true})
    email?: StringFilter;

    @Field(() => BoolFilter, {nullable:true})
    emailVerified?: BoolFilter;

    @Field(() => StringNullableFilter, {nullable:true})
    avatarUrl?: StringNullableFilter;

    @Field(() => StringNullableFilter, {nullable:true})
    phoneNumber?: StringNullableFilter;

    @Field(() => DateTimeNullableFilter, {nullable:true})
    lastSeen?: DateTimeNullableFilter;

    @Field(() => BoolFilter, {nullable:true})
    disabled?: BoolFilter;

    @HideField()
    passwordHash?: StringNullableFilter;

    @Field(() => JsonNullableFilter, {nullable:true})
    metadata?: JsonNullableFilter;

    @Field(() => StringFilter, {nullable:true})
    settingsId?: StringFilter;

    @HideField()
    deletedAt?: DateTimeNullableFilter;

    @Field(() => DateTimeFilter, {nullable:true})
    createdAt?: DateTimeFilter;

    @Field(() => DateTimeFilter, {nullable:true})
    updatedAt?: DateTimeFilter;

    @HideField()
    workspaceMember?: WorkspaceMemberRelationFilter;

    @Field(() => CompanyListRelationFilter, {nullable:true})
    companies?: CompanyListRelationFilter;

    @HideField()
    refreshTokens?: RefreshTokenListRelationFilter;

    @Field(() => CommentListRelationFilter, {nullable:true})
    comments?: CommentListRelationFilter;

    @Field(() => CommentThreadListRelationFilter, {nullable:true})
    authoredCommentThreads?: CommentThreadListRelationFilter;

    @Field(() => CommentThreadListRelationFilter, {nullable:true})
    assignedCommentThreads?: CommentThreadListRelationFilter;

    @Field(() => UserSettingsRelationFilter, {nullable:true})
    settings?: UserSettingsRelationFilter;
}
