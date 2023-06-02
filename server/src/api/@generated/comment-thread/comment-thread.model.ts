import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { ID } from '@nestjs/graphql';
import { HideField } from '@nestjs/graphql';
import { CommentThreadTarget } from '../comment-thread-target/comment-thread-target.model';
import { Comment } from '../comment/comment.model';
import { Workspace } from '../workspace/workspace.model';
import { CommentThreadCount } from '../comment/comment-thread-count.output';

@ObjectType()
export class CommentThread {
  @Field(() => ID, { nullable: false })
  id!: string;

  @Field(() => Date, { nullable: false })
  createdAt!: Date;

  @Field(() => Date, { nullable: false })
  updatedAt!: Date;

  @Field(() => Date, { nullable: true })
  deletedAt!: Date | null;

  @HideField()
  workspaceId!: string;

  @Field(() => [CommentThreadTarget], { nullable: true })
  commentThreadTargets?: Array<CommentThreadTarget>;

  @Field(() => [Comment], { nullable: true })
  comments?: Array<Comment>;

  @HideField()
  workspace?: Workspace;

  @Field(() => CommentThreadCount, { nullable: false })
  _count?: CommentThreadCount;
}
