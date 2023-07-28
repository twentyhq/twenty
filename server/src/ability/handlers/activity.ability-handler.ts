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
import { assert } from 'src/utils/assert';
import { ActivityWhereInput } from 'src/core/@generated/activity/activity-where.input';

class ActivityArgs {
  where?: ActivityWhereInput;
}

@Injectable()
export class ManageActivityAbilityHandler implements IAbilityHandler {
  async handle(ability: AppAbility) {
    return ability.can(AbilityAction.Manage, 'Activity');
  }
}

@Injectable()
export class ReadActivityAbilityHandler implements IAbilityHandler {
  handle(ability: AppAbility) {
    return ability.can(AbilityAction.Read, 'Activity');
  }
}

@Injectable()
export class CreateActivityAbilityHandler implements IAbilityHandler {
  handle(ability: AppAbility) {
    return ability.can(AbilityAction.Create, 'Activity');
  }
}

@Injectable()
export class UpdateActivityAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs<ActivityArgs>();
    const Activity = await this.prismaService.client.activity.findFirst({
      where: args.where,
    });
    assert(Activity, '', NotFoundException);

    return ability.can(AbilityAction.Update, subject('Activity', Activity));
  }
}

@Injectable()
export class DeleteActivityAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs<ActivityArgs>();
    const Activity = await this.prismaService.client.activity.findFirst({
      where: args.where,
    });
    assert(Activity, '', NotFoundException);

    return ability.can(AbilityAction.Delete, subject('Activity', Activity));
  }
}
