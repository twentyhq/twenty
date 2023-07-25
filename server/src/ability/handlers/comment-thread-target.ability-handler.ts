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
import { CommentThreadTargetWhereInput } from 'src/core/@generated/comment-thread-target/comment-thread-target-where.input';
import { relationAbilityChecker } from 'src/ability/ability.util';
import { assert } from 'src/utils/assert';

class CommentThreadTargetArgs {
  where?: CommentThreadTargetWhereInput;
  [key: string]: any;
}

@Injectable()
export class ManageCommentThreadTargetAbilityHandler
  implements IAbilityHandler
{
  async handle(ability: AppAbility) {
    return ability.can(AbilityAction.Manage, 'CommentThreadTarget');
  }
}

@Injectable()
export class ReadCommentThreadTargetAbilityHandler implements IAbilityHandler {
  handle(ability: AppAbility) {
    return ability.can(AbilityAction.Read, 'CommentThreadTarget');
  }
}

@Injectable()
export class CreateCommentThreadTargetAbilityHandler
  implements IAbilityHandler
{
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs();

    const allowed = await relationAbilityChecker(
      'CommentThreadTarget',
      ability,
      this.prismaService.client,
      args,
    );

    if (!allowed) {
      return false;
    }

    return ability.can(AbilityAction.Create, 'CommentThreadTarget');
  }
}

@Injectable()
export class UpdateCommentThreadTargetAbilityHandler
  implements IAbilityHandler
{
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs<CommentThreadTargetArgs>();
    const commentThreadTarget =
      await this.prismaService.client.commentThreadTarget.findFirst({
        where: args.where,
      });
    assert(commentThreadTarget, '', NotFoundException);

    const allowed = await relationAbilityChecker(
      'CommentThreadTarget',
      ability,
      this.prismaService.client,
      args,
    );

    if (!allowed) {
      return false;
    }

    return ability.can(
      AbilityAction.Update,
      subject('CommentThreadTarget', commentThreadTarget),
    );
  }
}

@Injectable()
export class DeleteCommentThreadTargetAbilityHandler
  implements IAbilityHandler
{
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs<CommentThreadTargetArgs>();
    const commentThreadTarget =
      await this.prismaService.client.commentThreadTarget.findFirst({
        where: args.where,
      });
    assert(commentThreadTarget, '', NotFoundException);

    return ability.can(
      AbilityAction.Delete,
      subject('CommentThreadTarget', commentThreadTarget),
    );
  }
}
