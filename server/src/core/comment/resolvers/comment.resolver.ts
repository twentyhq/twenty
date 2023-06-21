import { Resolver, Args, Mutation, Info } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { Workspace } from '../../../core/@generated/workspace/workspace.model';
import { AuthWorkspace } from '../../../decorators/auth-workspace.decorator';
import { CreateOneCommentArgs } from '../../../core/@generated/comment/create-one-comment.args';
import { Comment } from '../../../core/@generated/comment/comment.model';
import { CreateOneCommentGuard } from '../../../guards/create-one-comment.guard';
import { Prisma } from '@prisma/client';
import { CommentService } from '../services/comment.service';
import { GraphQLResolveInfo } from 'graphql';
import { PrismaSelect } from 'src/utils/prisma-select';

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
    @Info() info: GraphQLResolveInfo,
  ): Promise<Partial<Comment>> {
    const select = new PrismaSelect('Comment', info, {
      defaultFields: {
        Comment: {
          id: true,
        },
      },
    }).value;

    return this.commentService.create({
      data: {
        ...args.data,
        ...{ workspace: { connect: { id: workspace.id } } },
      },
      select,
    } as Prisma.CommentCreateArgs);
  }
}
