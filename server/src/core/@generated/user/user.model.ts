import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { ID } from '@nestjs/graphql';
import { HideField } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { WorkspaceMember } from '../workspace-member/workspace-member.model';
import { Company } from '../company/company.model';
import { RefreshToken } from '../refresh-token/refresh-token.model';
import { Comment } from '../comment/comment.model';
import { CommentThread } from '../comment-thread/comment-thread.model';
import { UserSettings } from '../user-settings/user-settings.model';
import { UserCount } from './user-count.output';

@ObjectType()
export class User {

    @Field(() => ID, {nullable:false})
    id!: string;

    @Field(() => String, {nullable:true})
    firstName!: string | null;

    @Field(() => String, {nullable:true})
    lastName!: string | null;

    @Field(() => String, {nullable:false})
    email!: string;

    @Field(() => Boolean, {nullable:false,defaultValue:false})
    emailVerified!: boolean;

    @Field(() => String, {nullable:true})
    avatarUrl!: string | null;

    @Field(() => String, {nullable:false})
    locale!: string;

    @Field(() => String, {nullable:true})
    phoneNumber!: string | null;

    @Field(() => Date, {nullable:true})
    lastSeen!: Date | null;

    @Field(() => Boolean, {nullable:false,defaultValue:false})
    disabled!: boolean;

    @HideField()
    passwordHash!: string | null;

    @Field(() => GraphQLJSON, {nullable:true})
    metadata!: any | null;

    @Field(() => String, {nullable:false})
    settingsId!: string;

    @HideField()
    deletedAt!: Date | null;

    @Field(() => Date, {nullable:false})
    createdAt!: Date;

    @Field(() => Date, {nullable:false})
    updatedAt!: Date;

    @Field(() => WorkspaceMember, {nullable:true})
    workspaceMember?: WorkspaceMember | null;

    @Field(() => [Company], {nullable:true})
    companies?: Array<Company>;

    @HideField()
    refreshTokens?: Array<RefreshToken>;

    @Field(() => [Comment], {nullable:true})
    comments?: Array<Comment>;

    @Field(() => [CommentThread], {nullable:true})
    authoredCommentThreads?: Array<CommentThread>;

    @Field(() => [CommentThread], {nullable:true})
    assignedCommentThreads?: Array<CommentThread>;

    @Field(() => UserSettings, {nullable:false})
    settings?: UserSettings;

    @HideField()
    _count?: UserCount;
}
