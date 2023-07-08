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
import { UpdateOneCommentThreadArgs } from 'src/core/@generated/comment-thread/update-one-comment-thread.args';
import { Prisma } from '@prisma/client';
import {
  PrismaSelector,
  PrismaSelect,
} from 'src/decorators/prisma-select.decorator';
import { AbilityGuard } from 'src/guards/ability.guard';
import { CheckAbilities } from 'src/decorators/check-abilities.decorator';
import {
  CreateCommentThreadAbilityHandler,
  DeleteCommentThreadAbilityHandler,
  ReadCommentThreadAbilityHandler,
  UpdateCommentThreadAbilityHandler,
} from 'src/ability/handlers/comment-thread.ability-handler';
import { UserAbility } from 'src/decorators/user-ability.decorator';
import { AppAbility } from 'src/ability/ability.factory';
import { accessibleBy } from '@casl/prisma';
import { AffectedRows } from 'src/core/@generated/prisma/affected-rows.output';
import { DeleteManyCommentThreadArgs } from 'src/core/@generated/comment-thread/delete-many-comment-thread.args';

@UseGuards(JwtAuthGuard)
@Resolver(() => CommentThread)
export class CommentThreadResolver {
  constructor(private readonly commentThreadService: CommentThreadService) {}

  @UseGuards(CreateOneCommentThreadGuard)
  @Mutation(() => CommentThread, {
    nullable: false,
  })
  @UseGuards(AbilityGuard)
  @CheckAbilities(CreateCommentThreadAbilityHandler)
  async createOneCommentThread(
    @Args() args: CreateOneCommentThreadArgs,
    @AuthWorkspace() workspace: Workspace,
    @PrismaSelector({ modelName: 'CommentThread' })
    prismaSelect: PrismaSelect<'CommentThread'>,
  ): Promise<Partial<CommentThread>> {
    /*const newCommentData = args.data.comments?.createMany?.data
      ? args.data.comments?.createMany?.data?.map((comment) => ({
          ...comment,
          ...{ workspaceId: workspace.id },
        }))
      : [];
      
      TODO: check/discuss (strange bug)
      
      */

    const createData = {
      ...args.data,
      // comments: { createMany: { data: newCommentData } },
      workspace: { connect: { id: workspace.id } },
    };

    const createdCommentThread = await this.commentThreadService.create({
      data: createData,
      select: prismaSelect.value,
    });

    return createdCommentThread;
  }

  @Mutation(() => CommentThread, {
    nullable: false,
  })
  @UseGuards(AbilityGuard)
  @CheckAbilities(UpdateCommentThreadAbilityHandler)
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
  @UseGuards(AbilityGuard)
  @CheckAbilities(ReadCommentThreadAbilityHandler)
  async findManyCommentThreads(
    @Args() args: FindManyCommentThreadArgs,
    @UserAbility() ability: AppAbility,
    @PrismaSelector({ modelName: 'CommentThread' })
    prismaSelect: PrismaSelect<'CommentThread'>,
  ): Promise<Partial<CommentThread>[]> {
    const result = await this.commentThreadService.findMany({
      ...args,
      where: {
        ...args.where,
        AND: [accessibleBy(ability).CommentThread],
      },
      select: prismaSelect.value,
    });

    return result;
  }

  @Mutation(() => AffectedRows, {
    nullable: false,
  })
  @UseGuards(AbilityGuard)
  @CheckAbilities(DeleteCommentThreadAbilityHandler)
  async deleteManyCommentThreads(
    @Args() args: DeleteManyCommentThreadArgs,
  ): Promise<AffectedRows> {
    return this.commentThreadService.deleteMany({
      ...args,
    });
  }
}
