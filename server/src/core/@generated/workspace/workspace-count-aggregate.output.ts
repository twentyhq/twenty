import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { Int } from '@nestjs/graphql';
import { HideField } from '@nestjs/graphql';

@ObjectType()
export class WorkspaceCountAggregate {

    @Field(() => Int, {nullable:false})
    id!: number;

    @Field(() => Int, {nullable:false})
    domainName!: number;

    @Field(() => Int, {nullable:false})
    displayName!: number;

    @Field(() => Int, {nullable:false})
    logo!: number;

    @Field(() => Int, {nullable:false})
    inviteHash!: number;

    @HideField()
    deletedAt!: number;

    @Field(() => Int, {nullable:false})
    createdAt!: number;

    @Field(() => Int, {nullable:false})
    updatedAt!: number;

    @Field(() => Int, {nullable:false})
    _all!: number;
}
