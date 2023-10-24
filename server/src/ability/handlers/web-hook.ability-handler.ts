import {
  Injectable,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { subject } from '@casl/ability';

import { IAbilityHandler } from 'src/ability/interfaces/ability-handler.interface';

import { AppAbility } from 'src/ability/ability.factory';
import { relationAbilityChecker } from 'src/ability/ability.util';
import { PrismaService } from 'src/database/prisma.service';
import { AbilityAction } from 'src/ability/ability.action';
import { assert } from 'src/utils/assert';

@Injectable()
export class CreateWebHookAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs();
    const allowed = await relationAbilityChecker(
      'WebHook',
      ability,
      this.prismaService.client,
      args,
    );
    if (!allowed) {
      return false;
    }
    return ability.can(AbilityAction.Create, 'WebHook');
  }
}

@Injectable()
export class DeleteWebHookAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}
  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs();
    const hook = await this.prismaService.client.webHook.findFirst({
      where: args.where,
    });
    assert(hook, '', NotFoundException);
    return ability.can(AbilityAction.Delete, subject('WebHook', hook));
  }
}

@Injectable()
export class ReadWebHookAbilityHandler implements IAbilityHandler {
  async handle(ability: AppAbility) {
    return ability.can(AbilityAction.Read, 'WebHook');
  }
}
