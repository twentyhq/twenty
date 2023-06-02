import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { ID } from '@nestjs/graphql';
import { HideField } from '@nestjs/graphql';
import { User } from '../user/user.model';
import { CommentThread } from '../comment-thread/comment-thread.model';
import { Workspace } from '../workspace/workspace.model';

@ObjectType()
export class Comment {
  @Field(() => ID, { nullable: false })
  id!: string;

  @Field(() => Date, { nullable: false })
  createdAt!: Date;

  @Field(() => Date, { nullable: false })
  updatedAt!: Date;

  @Field(() => Date, { nullable: true })
  deletedAt!: Date | null;

  @Field(() => String, { nullable: false })
  body!: string;

  @Field(() => String, { nullable: false })
  authorId!: string;

  @Field(() => String, { nullable: false })
  commentThreadId!: string;

  @HideField()
  workspaceId!: string;

  @Field(() => User, { nullable: false })
  author?: User;

  @Field(() => CommentThread, { nullable: false })
  commentThread?: CommentThread;

  @HideField()
  workspace?: Workspace;
}
