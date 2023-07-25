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
import { CommentWhereInput } from 'src/core/@generated/comment/comment-where.input';
import { relationAbilityChecker } from 'src/ability/ability.util';
import { assert } from 'src/utils/assert';

class CommentArgs {
  where?: CommentWhereInput;
  [key: string]: any;
}

@Injectable()
export class ManageCommentAbilityHandler implements IAbilityHandler {
  async handle(ability: AppAbility) {
    return ability.can(AbilityAction.Manage, 'Comment');
  }
}

@Injectable()
export class ReadCommentAbilityHandler implements IAbilityHandler {
  handle(ability: AppAbility) {
    return ability.can(AbilityAction.Read, 'Comment');
  }
}

@Injectable()
export class CreateCommentAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs();

    const allowed = await relationAbilityChecker(
      'Comment',
      ability,
      this.prismaService.client,
      args,
    );

    if (!allowed) {
      return false;
    }

    return ability.can(AbilityAction.Create, 'Comment');
  }
}

@Injectable()
export class UpdateCommentAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs<CommentArgs>();
    const comment = await this.prismaService.client.comment.findFirst({
      where: args.where,
    });
    assert(comment, '', NotFoundException);

    const allowed = await relationAbilityChecker(
      'Comment',
      ability,
      this.prismaService.client,
      args,
    );

    if (!allowed) {
      return false;
    }

    return ability.can(AbilityAction.Update, subject('Comment', comment));
  }
}

@Injectable()
export class DeleteCommentAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs<CommentArgs>();
    const comment = await this.prismaService.client.comment.findFirst({
      where: args.where,
    });
    assert(comment, '', NotFoundException);

    return ability.can(AbilityAction.Delete, subject('Comment', comment));
  }
}
