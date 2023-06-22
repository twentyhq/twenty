import { Resolver, Args, Mutation } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { Workspace } from '../../../core/@generated/workspace/workspace.model';
import { AuthWorkspace } from '../../../decorators/auth-workspace.decorator';
import { CreateOneCommentArgs } from '../../../core/@generated/comment/create-one-comment.args';
import { Comment } from '../../../core/@generated/comment/comment.model';
import { CreateOneCommentGuard } from '../../../guards/create-one-comment.guard';
import { Prisma } from '@prisma/client';
import { CommentService } from '../services/comment.service';
import {
  PrismaSelector,
  PrismaSelect,
} from 'src/decorators/prisma-select.decorator';

@UseGuards(JwtAuthGuard)
@Resolver(() => Comment)
export class CommentResolver {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(CreateOneCommentGuard)
  @Mutation(() => Comment, {
    nullable: false,
  })
  async createOneComment(
    @Args() args: CreateOneCommentArgs,
    @AuthWorkspace() workspace: Workspace,
    @PrismaSelector({ modelName: 'Comment' })
    prismaSelect: PrismaSelect<'Comment'>,
  ): Promise<Partial<Comment>> {
    return this.commentService.create({
      data: {
        ...args.data,
        ...{ workspace: { connect: { id: workspace.id } } },
      },
      select: prismaSelect.value,
    } as Prisma.CommentCreateArgs);
  }
}
