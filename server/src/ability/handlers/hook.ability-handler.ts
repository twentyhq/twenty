import { Injectable, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { IAbilityHandler } from 'src/ability/interfaces/ability-handler.interface';

import { AppAbility } from 'src/ability/ability.factory';
import { relationAbilityChecker } from 'src/ability/ability.util';
import { PrismaService } from 'src/database/prisma.service';
import { AbilityAction } from 'src/ability/ability.action';

@Injectable()
export class CreateHookAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}
  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs();
    const allowed = await relationAbilityChecker(
      'Hook',
      ability,
      this.prismaService.client,
      args,
    );
    if (!allowed) {
      return false;
    }
    return ability.can(AbilityAction.Create, 'Hook');
  }
}
