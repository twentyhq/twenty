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
import { relationAbilityChecker } from 'src/ability/ability.util';
import { assert } from 'src/utils/assert';
import { UserSettingsWhereInput } from 'src/core/@generated/user-settings/user-settings-where.input';

class UserSettingsArgs {
  where?: UserSettingsWhereInput;
  [key: string]: any;
}

@Injectable()
export class UpdateUserSettingsAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs<UserSettingsArgs>();
    const userSettings = await this.prismaService.client.userSettings.findFirst(
      {
        where: args.where,
      },
    );
    assert(userSettings, '', NotFoundException);

    const allowed = await relationAbilityChecker(
      'UserSettings',
      ability,
      this.prismaService.client,
      args,
    );

    if (!allowed) {
      return false;
    }

    return ability.can(
      AbilityAction.Update,
      subject('UserSettings', userSettings),
    );
  }
}
