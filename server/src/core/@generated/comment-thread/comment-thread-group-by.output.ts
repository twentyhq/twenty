import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import * as Validator from 'class-validator';
import { HideField } from '@nestjs/graphql';
import { ActivityType } from '../prisma/activity-type.enum';
import { CommentThreadCountAggregate } from './comment-thread-count-aggregate.output';
import { CommentThreadMinAggregate } from './comment-thread-min-aggregate.output';
import { CommentThreadMaxAggregate } from './comment-thread-max-aggregate.output';

@ObjectType()
export class CommentThreadGroupBy {

    @Field(() => String, {nullable:false})
    @Validator.IsString()
    @Validator.IsOptional()
    id!: string;

    @HideField()
    workspaceId!: string;

    @Field(() => String, {nullable:false})
    authorId!: string;

    @Field(() => String, {nullable:true})
    body?: string;

    @Field(() => String, {nullable:true})
    title?: string;

    @Field(() => ActivityType, {nullable:false})
    type!: keyof typeof ActivityType;

    @Field(() => Date, {nullable:true})
    reminderAt?: Date | string;

    @Field(() => Date, {nullable:true})
    dueAt?: Date | string;

    @Field(() => Date, {nullable:true})
    completedAt?: Date | string;

    @Field(() => String, {nullable:true})
    assigneeId?: string;

    @HideField()
    deletedAt?: Date | string;

    @Field(() => Date, {nullable:false})
    createdAt!: Date | string;

    @Field(() => Date, {nullable:false})
    updatedAt!: Date | string;

    @Field(() => CommentThreadCountAggregate, {nullable:true})
    _count?: CommentThreadCountAggregate;

    @Field(() => CommentThreadMinAggregate, {nullable:true})
    _min?: CommentThreadMinAggregate;

    @Field(() => CommentThreadMaxAggregate, {nullable:true})
    _max?: CommentThreadMaxAggregate;
}
