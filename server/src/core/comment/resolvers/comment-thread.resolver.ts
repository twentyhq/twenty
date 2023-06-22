import { Resolver, Args, Mutation, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { Workspace } from '../../../core/@generated/workspace/workspace.model';
import { AuthWorkspace } from '../../../decorators/auth-workspace.decorator';
import { CommentThread } from '../../../core/@generated/comment-thread/comment-thread.model';
import { CreateOneCommentThreadArgs } from '../../../core/@generated/comment-thread/create-one-comment-thread.args';
import { CreateOneCommentThreadGuard } from '../../../guards/create-one-comment-thread.guard';
import { FindManyCommentThreadArgs } from '../../../core/@generated/comment-thread/find-many-comment-thread.args';
import { CommentThreadService } from '../services/comment-thread.service';
import { prepareFindManyArgs } from 'src/utils/prepare-find-many';
import { UpdateOneCommentThreadArgs } from 'src/core/@generated/comment-thread/update-one-comment-thread.args';
import { Prisma } from '@prisma/client';
import {
  PrismaSelector,
  PrismaSelect,
} from 'src/decorators/prisma-select.decorator';

@UseGuards(JwtAuthGuard)
@Resolver(() => CommentThread)
export class CommentThreadResolver {
  constructor(private readonly commentThreadService: CommentThreadService) {}

  @UseGuards(CreateOneCommentThreadGuard)
  @Mutation(() => CommentThread, {
    nullable: false,
  })
  async createOneCommentThread(
    @Args() args: CreateOneCommentThreadArgs,
    @AuthWorkspace() workspace: Workspace,
    @PrismaSelector({ modelName: 'CommentThread' })
    prismaSelect: PrismaSelect<'CommentThread'>,
  ): Promise<Partial<CommentThread>> {
    const newCommentData = args.data.comments?.createMany?.data
      ? args.data.comments?.createMany?.data?.map((comment) => ({
          ...comment,
          ...{ workspaceId: workspace.id },
        }))
      : [];

    const createdCommentThread = await this.commentThreadService.create({
      data: {
        ...args.data,
        ...{ comments: { createMany: { data: newCommentData } } },
        ...{ workspace: { connect: { id: workspace.id } } },
      },
      select: prismaSelect.value,
    });

    return createdCommentThread;
  }

  @Mutation(() => CommentThread, {
    nullable: false,
  })
  async updateOneCommentThread(
    @Args() args: UpdateOneCommentThreadArgs,
    @PrismaSelector({ modelName: 'CommentThread' })
    prismaSelect: PrismaSelect<'CommentThread'>,
  ): Promise<Partial<CommentThread>> {
    const updatedCommentThread = await this.commentThreadService.update({
      ...args,
      select: prismaSelect.value,
    } as Prisma.CommentThreadUpdateArgs);

    return updatedCommentThread;
  }

  @Query(() => [CommentThread])
  async findManyCommentThreads(
    @Args() args: FindManyCommentThreadArgs,
    @AuthWorkspace() workspace: Workspace,
    @PrismaSelector({ modelName: 'CommentThread' })
    prismaSelect: PrismaSelect<'CommentThread'>,
  ): Promise<Partial<CommentThread>[]> {
    const preparedArgs = prepareFindManyArgs<FindManyCommentThreadArgs>(
      args,
      workspace,
    );

    const result = await this.commentThreadService.findMany({
      ...preparedArgs,
      select: prismaSelect.value,
    });

    return result;
  }
}
