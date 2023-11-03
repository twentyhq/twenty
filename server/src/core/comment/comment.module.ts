import { Module } from '@nestjs/common';

import { AbilityModule } from 'src/ability/ability.module';
import { PrismaModule } from 'src/database/prisma.module';

import { CommentService } from './comment.service';
import { CommentResolver } from './comment.resolver';

@Module({
  imports: [AbilityModule, PrismaModule],
  providers: [CommentService, CommentResolver],
  exports: [CommentService],
})
export class CommentModule {}
