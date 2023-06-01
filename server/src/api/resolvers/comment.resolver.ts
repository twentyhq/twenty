import { Resolver, Args, Mutation } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { PrismaService } from 'src/database/prisma.service';
import { Workspace } from '../@generated/workspace/workspace.model';
import { AuthWorkspace } from './decorators/auth-workspace.decorator';
import { CreateOneCommentArgs } from '../@generated/comment/create-one-comment.args';
import { Comment } from '../@generated/comment/comment.model';
import { CreateOneCommentGuard } from './guards/create-one-comment.guard';

@UseGuards(JwtAuthGuard)
@Resolver(() => Comment)
export class CommentResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @UseGuards(CreateOneCommentGuard)
  @Mutation(() => Comment, {
    nullable: false,
  })
  async createOneComment(
    @Args() args: CreateOneCommentArgs,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<Comment> {
    return this.prismaService.comment.create({
      data: {
        ...args.data,
        ...{ workspace: { connect: { id: workspace.id } } },
      },
    });
  }
}
