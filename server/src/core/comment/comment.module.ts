import { Module } from '@nestjs/common';

import { CommentService } from './services/comment.service';
import { CommentResolver } from './resolvers/comment.resolver';
import { CommentThreadTargetService } from './services/comment-thread-target.service';
import { CommentThreadResolver } from './resolvers/comment-thread.resolver';
import { CommentThreadService } from './services/comment-thread.service';

@Module({
  providers: [
    CommentService,
    CommentThreadService,
    CommentThreadTargetService,
    CommentResolver,
    CommentThreadResolver,
  ],
  exports: [CommentService, CommentThreadService, CommentThreadTargetService],
})
export class CommentModule {}
