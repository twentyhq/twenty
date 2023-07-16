import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { Int } from '@nestjs/graphql';

@ObjectType()
export class UserCount {

    @Field(() => Int, {nullable:false})
    companies?: number;

    @Field(() => Int, {nullable:false})
    refreshTokens?: number;

    @Field(() => Int, {nullable:false})
    comments?: number;

    @Field(() => Int, {nullable:false})
    authoredCommentThreads?: number;

    @Field(() => Int, {nullable:false})
    assignedCommentThreads?: number;
}
