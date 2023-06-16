import { Module } from '@nestjs/common';
import { CommentService } from './services/comment.service';
import { CommentResolver } from './resolvers/comment.resolver';
import { CommentRelationsResolver } from './resolvers/comment-relations.resolver';
import { CommentThreadTargetService } from './services/comment-thread-target.service';
import { CommentThreadResolver } from './resolvers/comment-thread.resolver';
import { CommentThreadRelationsResolver } from './resolvers/comment-thread-relations.resolver';
import { CommentThreadService } from './services/comment-thread.service';

@Module({
  providers: [
    CommentService,
    CommentThreadService,
    CommentThreadTargetService,
    CommentResolver,
    CommentRelationsResolver,
    CommentThreadResolver,
    CommentThreadRelationsResolver,
  ],
  exports: [CommentService, CommentThreadService, CommentThreadTargetService],
})
export class CommentModule {}
