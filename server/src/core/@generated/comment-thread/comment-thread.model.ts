import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { ID } from '@nestjs/graphql';
import { HideField } from '@nestjs/graphql';
import { ActivityType } from '../prisma/activity-type.enum';
import { CommentThreadTarget } from '../comment-thread-target/comment-thread-target.model';
import { Comment } from '../comment/comment.model';
import { Workspace } from '../workspace/workspace.model';
import { User } from '../user/user.model';
import { Attachment } from '../attachment/attachment.model';
import { CommentThreadCount } from '../comment/comment-thread-count.output';

@ObjectType()
export class CommentThread {

    @Field(() => ID, {nullable:false})
    id!: string;

    @HideField()
    workspaceId!: string;

    @Field(() => String, {nullable:false})
    authorId!: string;

    @Field(() => String, {nullable:true})
    body!: string | null;

    @Field(() => String, {nullable:true})
    title!: string | null;

    @Field(() => ActivityType, {nullable:false,defaultValue:'Note'})
    type!: keyof typeof ActivityType;

    @Field(() => Date, {nullable:true})
    reminderAt!: Date | null;

    @Field(() => Date, {nullable:true})
    dueAt!: Date | null;

    @Field(() => Date, {nullable:true})
    completedAt!: Date | null;

    @Field(() => String, {nullable:true})
    assigneeId!: string | null;

    @HideField()
    deletedAt!: Date | null;

    @Field(() => Date, {nullable:false})
    createdAt!: Date;

    @Field(() => Date, {nullable:false})
    updatedAt!: Date;

    @Field(() => [CommentThreadTarget], {nullable:true})
    commentThreadTargets?: Array<CommentThreadTarget>;

    @Field(() => [Comment], {nullable:true})
    comments?: Array<Comment>;

    @HideField()
    workspace?: Workspace;

    @Field(() => User, {nullable:false})
    author?: User;

    @Field(() => User, {nullable:true})
    assignee?: User | null;

    @Field(() => [Attachment], {nullable:true})
    attachments?: Array<Attachment>;

    @HideField()
    _count?: CommentThreadCount;
}
