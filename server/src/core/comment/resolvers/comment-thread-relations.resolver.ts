import * as TypeGraphQL from '@nestjs/graphql';
import { CommentThreadTarget } from 'src/core/@generated/comment-thread-target/comment-thread-target.model';
import { CommentThread } from 'src/core/@generated/comment-thread/comment-thread.model';
import { Comment } from 'src/core/@generated/comment/comment.model';
import { CommentService } from '../services/comment.service';
import { CommentThreadTargetService } from '../services/comment-thread-target.service';

@TypeGraphQL.Resolver(() => CommentThread)
export class CommentThreadRelationsResolver {
  constructor(
    private readonly commentService: CommentService,
    private readonly commentThreadTargetService: CommentThreadTargetService,
  ) {}

  @TypeGraphQL.ResolveField(() => [Comment], {
    nullable: false,
  })
  async comments(
    @TypeGraphQL.Root() commentThread: CommentThread,
  ): Promise<Comment[]> {
    return this.commentService.findMany({
      where: {
        commentThreadId: commentThread.id,
      },
      orderBy: {
        // TODO: find a way to pass it in the query
        createdAt: 'desc',
      },
    });
  }

  @TypeGraphQL.ResolveField(() => [CommentThreadTarget], {
    nullable: true,
  })
  async commentThreadTargets(
    @TypeGraphQL.Root() commentThread: CommentThread,
  ): Promise<CommentThreadTarget[]> {
    return this.commentThreadTargetService.findMany({
      where: {
        commentThreadId: commentThread.id,
      },
      orderBy: {
        // TODO: find a way to pass it in the query
        createdAt: 'desc',
      },
    });
  }
}
