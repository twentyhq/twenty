import { Resolver, Args, Mutation, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { PrismaService } from 'src/database/prisma.service';
import { Workspace } from '../@generated/workspace/workspace.model';
import { AuthWorkspace } from './decorators/auth-workspace.decorator';
import { CommentThread } from '../@generated/comment-thread/comment-thread.model';
import { CreateOneCommentThreadArgs } from '../@generated/comment-thread/create-one-comment-thread.args';
import { CreateOneCommentThreadGuard } from './guards/create-one-comment-thread.guard';
import { FindManyCommentThreadArgs } from '../@generated/comment-thread/find-many-comment-thread.args';
import { ArgsService } from './services/args.service';

@UseGuards(JwtAuthGuard)
@Resolver(() => CommentThread)
export class CommentThreadResolver {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly argsService: ArgsService,
  ) {}

  @UseGuards(CreateOneCommentThreadGuard)
  @Mutation(() => CommentThread, {
    nullable: false,
  })
  async createOneCommentThread(
    @Args() args: CreateOneCommentThreadArgs,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<CommentThread> {
    const newCommentData = args.data.comments?.createMany?.data
      ? args.data.comments?.createMany?.data?.map((comment) => ({
          ...comment,
          ...{ workspaceId: workspace.id },
        }))
      : [];
    return this.prismaService.commentThread.create({
      data: {
        ...args.data,
        ...{ comments: { createMany: { data: newCommentData } } },
        ...{ workspace: { connect: { id: workspace.id } } },
      },
    });
  }

  @Query(() => [CommentThread])
  async findManyCommentThreads(
    @Args() args: FindManyCommentThreadArgs,
    @AuthWorkspace() workspace: Workspace,
  ) {
    const preparedArgs =
      await this.argsService.prepareFindManyArgs<FindManyCommentThreadArgs>(
        args,
        workspace,
      );
    const result = await this.prismaService.commentThread.findMany(
      preparedArgs,
    );

    console.log({ result });

    return result;
  }
}
