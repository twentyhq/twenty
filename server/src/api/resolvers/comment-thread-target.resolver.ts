import { Resolver, Args, Mutation, Query } from '@nestjs/graphql';
import { HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { PrismaService } from 'src/database/prisma.service';
import { Workspace } from '../@generated/workspace/workspace.model';
import { AuthWorkspace } from './decorators/auth-workspace.decorator';
import { CommentThread } from '../@generated/comment-thread/comment-thread.model';
import { ArgsService } from './services/args.service';
import { CommentThreadTarget } from '../@generated/comment-thread-target/comment-thread-target.model';
import { CreateOneCommentThreadTargetGuard } from './guards/create-one-comment-thread-target.guard';
import { CreateOneCommentThreadTargetArgs } from '../@generated/comment-thread-target/create-one-comment-thread-target.args';
import { FindManyCommentThreadTargetArgs } from '../@generated/comment-thread-target/find-many-comment-thread-target.args';

@UseGuards(JwtAuthGuard)
@Resolver(() => CommentThreadTarget)
export class CommentThreadTargetResolver {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly argsService: ArgsService,
  ) {}

  @UseGuards(CreateOneCommentThreadTargetGuard)
  @Mutation(() => CommentThread, {
    nullable: false,
  })
  async createOneCommentThreadTarget(
    @Args() args: CreateOneCommentThreadTargetArgs,
  ): Promise<CommentThreadTarget | null> {
    if (args.data.commentThread.connect?.id) {
      return await this.prismaService.commentThreadTarget.create({
        data: {
          commentableId: args.data.commentableId,
          commentableType: args.data.commentableType,
          commentThreadId: args.data.commentThread.connect?.id ?? '',
          id: args.data.id,
          createdAt: args.data.createdAt,
          updatedAt: args.data.updatedAt,
        },
      });
    }

    throw new HttpException(
      { reason: 'Missing commentThread id' },
      HttpStatus.BAD_REQUEST,
    );
  }

  @Query(() => [CommentThreadTarget])
  async findManyCommentThreadTargets(
    @Args() args: FindManyCommentThreadTargetArgs,
    @AuthWorkspace() workspace: Workspace,
  ) {
    const preparedArgs =
      await this.argsService.prepareFindManyArgs<FindManyCommentThreadTargetArgs>(
        args,
        workspace,
      );

    const result = await this.prismaService.commentThreadTarget.findMany(
      preparedArgs,
    );

    return result;
  }
}
