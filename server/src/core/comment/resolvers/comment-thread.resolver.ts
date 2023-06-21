import { Resolver, Args, Mutation, Query, Info } from '@nestjs/graphql';
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
import { PrismaSelect } from 'src/utils/prisma-select';
import { GraphQLResolveInfo } from 'graphql';

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
    @Info() info: GraphQLResolveInfo,
  ): Promise<Partial<CommentThread>> {
    const newCommentData = args.data.comments?.createMany?.data
      ? args.data.comments?.createMany?.data?.map((comment) => ({
          ...comment,
          ...{ workspaceId: workspace.id },
        }))
      : [];
    const select = new PrismaSelect('CommentThread', info, {
      defaultFields: {
        CommentThread: {
          id: true,
        },
      },
    }).value;

    const createdCommentThread = await this.commentThreadService.create({
      data: {
        ...args.data,
        ...{ comments: { createMany: { data: newCommentData } } },
        ...{ workspace: { connect: { id: workspace.id } } },
      },
      select,
    });

    return createdCommentThread;
  }

  @Mutation(() => CommentThread, {
    nullable: false,
  })
  async updateOneCommentThread(
    @Args() args: UpdateOneCommentThreadArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Partial<CommentThread>> {
    const select = new PrismaSelect('CommentThread', info, {
      defaultFields: {
        CommentThread: {
          id: true,
        },
      },
    }).value;
    const updatedCommentThread = await this.commentThreadService.update({
      ...args,
      select,
    } as Prisma.CommentThreadUpdateArgs);

    return updatedCommentThread;
  }

  @Query(() => [CommentThread])
  async findManyCommentThreads(
    @Args() args: FindManyCommentThreadArgs,
    @AuthWorkspace() workspace: Workspace,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Partial<CommentThread>[]> {
    const select = new PrismaSelect('CommentThread', info, {
      defaultFields: {
        CommentThread: {
          id: true,
        },
      },
    }).value;
    const preparedArgs = prepareFindManyArgs<FindManyCommentThreadArgs>(
      args,
      workspace,
    );

    const result = await this.commentThreadService.findMany({
      ...preparedArgs,
      select,
    });

    return result;
  }
}
