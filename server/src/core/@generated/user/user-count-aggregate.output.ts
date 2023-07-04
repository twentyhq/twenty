import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { Int } from '@nestjs/graphql';
import { HideField } from '@nestjs/graphql';

@ObjectType()
export class UserCountAggregate {

    @Field(() => Int, {nullable:false})
    id!: number;

    @Field(() => Int, {nullable:false})
    firstName!: number;

    @Field(() => Int, {nullable:false})
    lastName!: number;

    @Field(() => Int, {nullable:false})
    email!: number;

    @Field(() => Int, {nullable:false})
    emailVerified!: number;

    @Field(() => Int, {nullable:false})
    avatarUrl!: number;

    @Field(() => Int, {nullable:false})
    locale!: number;

    @Field(() => Int, {nullable:false})
    phoneNumber!: number;

    @Field(() => Int, {nullable:false})
    lastSeen!: number;

    @Field(() => Int, {nullable:false})
    disabled!: number;

    @HideField()
    passwordHash!: number;

    @Field(() => Int, {nullable:false})
    metadata!: number;

    @HideField()
    deletedAt!: number;

    @Field(() => Int, {nullable:false})
    createdAt!: number;

    @Field(() => Int, {nullable:false})
    updatedAt!: number;

    @Field(() => Int, {nullable:false})
    _all!: number;
}
