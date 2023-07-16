import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { Int } from '@nestjs/graphql';
import { HideField } from '@nestjs/graphql';

@ObjectType()
export class CommentThreadCountAggregate {

    @Field(() => Int, {nullable:false})
    id!: number;

    @HideField()
    workspaceId!: number;

    @Field(() => Int, {nullable:false})
    authorId!: number;

    @Field(() => Int, {nullable:false})
    body!: number;

    @Field(() => Int, {nullable:false})
    title!: number;

    @Field(() => Int, {nullable:false})
    type!: number;

    @Field(() => Int, {nullable:false})
    reminderAt!: number;

    @Field(() => Int, {nullable:false})
    dueAt!: number;

    @Field(() => Int, {nullable:false})
    completedAt!: number;

    @Field(() => Int, {nullable:false})
    assigneeId!: number;

    @HideField()
    deletedAt!: number;

    @Field(() => Int, {nullable:false})
    createdAt!: number;

    @Field(() => Int, {nullable:false})
    updatedAt!: number;

    @Field(() => Int, {nullable:false})
    _all!: number;
}
