import { Module } from '@nestjs/common';

import { CommentService } from './comment.service';
import { CommentResolver } from './comment.resolver';

@Module({
  providers: [CommentService, CommentResolver],
  exports: [CommentService],
})
export class CommentModule {}
