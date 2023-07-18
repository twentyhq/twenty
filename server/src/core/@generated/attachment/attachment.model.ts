import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { ID } from '@nestjs/graphql';
import { AttachmentType } from '../prisma/attachment-type.enum';
import { HideField } from '@nestjs/graphql';
import { User } from '../user/user.model';
import { CommentThread } from '../comment-thread/comment-thread.model';

@ObjectType()
export class Attachment {

    @Field(() => ID, {nullable:false})
    id!: string;

    @Field(() => String, {nullable:false})
    fullPath!: string;

    @Field(() => AttachmentType, {nullable:false})
    type!: keyof typeof AttachmentType;

    @Field(() => String, {nullable:false})
    name!: string;

    @Field(() => String, {nullable:false})
    authorId!: string;

    @Field(() => String, {nullable:false})
    activityId!: string;

    @HideField()
    workspaceId!: string;

    @HideField()
    deletedAt!: Date | null;

    @Field(() => Date, {nullable:false})
    createdAt!: Date;

    @Field(() => Date, {nullable:false})
    updatedAt!: Date;

    @Field(() => User, {nullable:false})
    author?: User;

    @Field(() => CommentThread, {nullable:false})
    activity?: CommentThread;
}
