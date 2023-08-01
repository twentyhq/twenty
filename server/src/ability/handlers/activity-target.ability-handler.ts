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
import { ActivityTargetWhereInput } from 'src/core/@generated/activity-target/activity-target-where.input';

class ActivityTargetArgs {
  where?: ActivityTargetWhereInput;
}

@Injectable()
export class ManageActivityTargetAbilityHandler implements IAbilityHandler {
  async handle(ability: AppAbility) {
    return ability.can(AbilityAction.Manage, 'ActivityTarget');
  }
}

@Injectable()
export class ReadActivityTargetAbilityHandler implements IAbilityHandler {
  handle(ability: AppAbility) {
    return ability.can(AbilityAction.Read, 'ActivityTarget');
  }
}

@Injectable()
export class CreateActivityTargetAbilityHandler implements IAbilityHandler {
  handle(ability: AppAbility) {
    return ability.can(AbilityAction.Create, 'ActivityTarget');
  }
}

@Injectable()
export class UpdateActivityTargetAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs<ActivityTargetArgs>();
    const ActivityTarget =
      await this.prismaService.client.activityTarget.findFirst({
        where: args.where,
      });
    assert(ActivityTarget, '', NotFoundException);

    return ability.can(
      AbilityAction.Update,
      subject('ActivityTarget', ActivityTarget),
    );
  }
}

@Injectable()
export class DeleteActivityTargetAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs<ActivityTargetArgs>();
    const ActivityTarget =
      await this.prismaService.client.activityTarget.findFirst({
        where: args.where,
      });
    assert(ActivityTarget, '', NotFoundException);

    return ability.can(
      AbilityAction.Delete,
      subject('ActivityTarget', ActivityTarget),
    );
  }
}
