import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { ID } from '@nestjs/graphql';
import { CommentableType } from '../prisma/commentable-type.enum';
import { HideField } from '@nestjs/graphql';
import { CommentThread } from '../comment-thread/comment-thread.model';

@ObjectType()
export class CommentThreadTarget {

    @Field(() => ID, {nullable:false})
    id!: string;

    @Field(() => String, {nullable:false})
    commentThreadId!: string;

    @Field(() => CommentableType, {nullable:false})
    commentableType!: keyof typeof CommentableType;

    @Field(() => String, {nullable:false})
    commentableId!: string;

    @HideField()
    deletedAt!: Date | null;

    @Field(() => Date, {nullable:false})
    createdAt!: Date;

    @Field(() => Date, {nullable:false})
    updatedAt!: Date;

    @Field(() => CommentThread, {nullable:false})
    commentThread?: CommentThread;
}
