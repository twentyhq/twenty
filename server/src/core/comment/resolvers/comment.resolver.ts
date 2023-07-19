import { Resolver, Args, Mutation } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { Workspace } from 'src/core/@generated/workspace/workspace.model';
import { AuthWorkspace } from 'src/decorators/auth-workspace.decorator';
import { CreateOneCommentArgs } from 'src/core/@generated/comment/create-one-comment.args';
import { Comment } from 'src/core/@generated/comment/comment.model';
import { CreateOneCommentGuard } from 'src/guards/create-one-comment.guard';
import { CommentService } from 'src/core/comment/services/comment.service';
import {
  PrismaSelector,
  PrismaSelect,
} from 'src/decorators/prisma-select.decorator';
import { AbilityGuard } from 'src/guards/ability.guard';
import { CheckAbilities } from 'src/decorators/check-abilities.decorator';
import { CreateCommentAbilityHandler } from 'src/ability/handlers/comment.ability-handler';
import { AuthUser } from 'src/decorators/auth-user.decorator';
import { User } from 'src/core/@generated/user/user.model';

@UseGuards(JwtAuthGuard)
@Resolver(() => Comment)
export class CommentResolver {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(CreateOneCommentGuard)
  @Mutation(() => Comment, {
    nullable: false,
  })
  @UseGuards(AbilityGuard)
  @CheckAbilities(CreateCommentAbilityHandler)
  async createOneComment(
    @Args() args: CreateOneCommentArgs,
    @AuthUser() user: User,
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
