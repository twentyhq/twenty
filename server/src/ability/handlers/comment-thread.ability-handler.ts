import {
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { subject } from '@casl/ability';

import { IAbilityHandler } from 'src/ability/interfaces/ability-handler.interface';

import { PrismaService } from 'src/database/prisma.service';
import { AbilityAction } from 'src/ability/ability.action';
import { AppAbility } from 'src/ability/ability.factory';
import { CommentThreadWhereInput } from 'src/core/@generated/comment-thread/comment-thread-where.input';
import { relationAbilityChecker } from 'src/ability/ability.util';
import { assert } from 'src/utils/assert';

class CommentThreadArgs {
  where?: CommentThreadWhereInput;
  [key: string]: any;
}

@Injectable()
export class ManageCommentThreadAbilityHandler implements IAbilityHandler {
  async handle(ability: AppAbility) {
    return ability.can(AbilityAction.Manage, 'CommentThread');
  }
}

@Injectable()
export class ReadCommentThreadAbilityHandler implements IAbilityHandler {
  handle(ability: AppAbility) {
    return ability.can(AbilityAction.Read, 'CommentThread');
  }
}

@Injectable()
export class CreateCommentThreadAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs();

    const allowed = await relationAbilityChecker(
      'CommentThread',
      ability,
      this.prismaService.client,
      args,
    );

    if (!allowed) {
      return false;
    }

    return ability.can(AbilityAction.Create, 'CommentThread');
  }
}

@Injectable()
export class UpdateCommentThreadAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs<CommentThreadArgs>();
    const commentThread =
      await this.prismaService.client.commentThread.findFirst({
        where: args.where,
      });
    assert(commentThread, '', NotFoundException);

    const allowed = await relationAbilityChecker(
      'CommentThread',
      ability,
      this.prismaService.client,
      args,
    );

    if (!allowed) {
      return false;
    }

    return ability.can(
      AbilityAction.Update,
      subject('CommentThread', commentThread),
    );
  }
}

@Injectable()
export class DeleteCommentThreadAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs<CommentThreadArgs>();
    const commentThread =
      await this.prismaService.client.commentThread.findFirst({
        where: args.where,
      });
    assert(commentThread, '', NotFoundException);

    return ability.can(
      AbilityAction.Delete,
      subject('CommentThread', commentThread),
    );
  }
}
