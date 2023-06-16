import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { Int } from '@nestjs/graphql';
import { HideField } from '@nestjs/graphql';

@ObjectType()
export class PersonCountAggregate {

    @Field(() => Int, {nullable:false})
    id!: number;

    @Field(() => Int, {nullable:false})
    createdAt!: number;

    @Field(() => Int, {nullable:false})
    updatedAt!: number;

    @Field(() => Int, {nullable:false})
    deletedAt!: number;

    @Field(() => Int, {nullable:false})
    firstname!: number;

    @Field(() => Int, {nullable:false})
    lastname!: number;

    @Field(() => Int, {nullable:false})
    email!: number;

    @Field(() => Int, {nullable:false})
    phone!: number;

    @Field(() => Int, {nullable:false})
    city!: number;

    @Field(() => Int, {nullable:false})
    companyId!: number;

    @HideField()
    workspaceId!: number;

    @Field(() => Int, {nullable:false})
    _all!: number;
}
