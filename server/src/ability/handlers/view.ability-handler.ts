import {
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { subject } from '@casl/ability';

import { IAbilityHandler } from 'src/ability/interfaces/ability-handler.interface';

import { AbilityAction } from 'src/ability/ability.action';
import { AppAbility } from 'src/ability/ability.factory';
import { relationAbilityChecker } from 'src/ability/ability.util';
import { ViewWhereInput } from 'src/core/@generated/view/view-where.input';
import { PrismaService } from 'src/database/prisma.service';
import { assert } from 'src/utils/assert';

class ViewArgs {
  where?: ViewWhereInput;
  [key: string]: any;
}

@Injectable()
export class ReadViewAbilityHandler implements IAbilityHandler {
  handle(ability: AppAbility) {
    return ability.can(AbilityAction.Read, 'View');
  }
}

@Injectable()
export class CreateViewAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs();

    const allowed = await relationAbilityChecker(
      'View',
      ability,
      this.prismaService.client,
      args,
    );

    if (!allowed) {
      return false;
    }

    return ability.can(AbilityAction.Create, 'View');
  }
}

@Injectable()
export class UpdateViewAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs<ViewArgs>();
    const view = await this.prismaService.client.view.findFirst({
      where: args.where,
    });
    assert(view, '', NotFoundException);

    const allowed = await relationAbilityChecker(
      'View',
      ability,
      this.prismaService.client,
      args,
    );

    if (!allowed) {
      return false;
    }

    return ability.can(AbilityAction.Update, subject('View', view));
  }
}

@Injectable()
export class DeleteViewAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs<ViewArgs>();
    const view = await this.prismaService.client.view.findFirst({
      where: args.where,
    });
    assert(view, '', NotFoundException);

    return ability.can(AbilityAction.Delete, subject('View', view));
  }
}
