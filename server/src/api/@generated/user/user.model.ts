import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { ID } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { WorkspaceMember } from '../workspace-member/workspace-member.model';
import { Company } from '../company/company.model';
import { RefreshToken } from '../refresh-token/refresh-token.model';
import { UserCount } from './user-count.output';

@ObjectType()
export class User {

    @Field(() => ID, {nullable:false})
    id!: string;

    @Field(() => Date, {nullable:false})
    createdAt!: Date;

    @Field(() => Date, {nullable:false})
    updatedAt!: Date;

    @Field(() => Date, {nullable:true})
    deletedAt!: Date | null;

    @Field(() => Date, {nullable:true})
    lastSeen!: Date | null;

    @Field(() => Boolean, {nullable:false,defaultValue:false})
    disabled!: boolean;

    @Field(() => String, {nullable:false})
    displayName!: string;

    @Field(() => String, {nullable:false})
    email!: string;

    @Field(() => String, {nullable:true})
    avatarUrl!: string | null;

    @Field(() => String, {nullable:false})
    locale!: string;

    @Field(() => String, {nullable:true})
    phoneNumber!: string | null;

    @Field(() => String, {nullable:true})
    passwordHash!: string | null;

    @Field(() => Boolean, {nullable:false,defaultValue:false})
    emailVerified!: boolean;

    @Field(() => GraphQLJSON, {nullable:true})
    metadata!: any | null;

    @Field(() => WorkspaceMember, {nullable:true})
    WorkspaceMember?: WorkspaceMember | null;

    @Field(() => [Company], {nullable:true})
    companies?: Array<Company>;

    @Field(() => [RefreshToken], {nullable:true})
    RefreshTokens?: Array<RefreshToken>;

    @Field(() => UserCount, {nullable:false})
    _count?: UserCount;
}
