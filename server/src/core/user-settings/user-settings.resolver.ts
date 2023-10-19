import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { UserSettings } from 'src/core/@generated/user-settings/user-settings.model';
import { UpdateOneUserSettingsArgs } from 'src/core/@generated/user-settings/update-one-user-settings.args';
import {
  PrismaSelect,
  PrismaSelector,
} from 'src/decorators/prisma-select.decorator';
import { assert } from 'src/utils/assert';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { UpdateUserSettingsAbilityHandler } from 'src/ability/handlers/user-settings.ability-handler';
import { CheckAbilities } from 'src/decorators/check-abilities.decorator';
import { AbilityGuard } from 'src/guards/ability.guard';

import { UserSettingsService } from './user-settings.service';

@UseGuards(JwtAuthGuard)
@Resolver(() => UserSettings)
export class UserSettingsResolver {
  constructor(private readonly userSettingsService: UserSettingsService) {}

  @Mutation(() => UserSettings)
  @UseGuards(AbilityGuard)
  @CheckAbilities(UpdateUserSettingsAbilityHandler)
  async updateUserSettings(
    @Args() args: UpdateOneUserSettingsArgs,
    @PrismaSelector({ modelName: 'UserSettings' })
    prismaSelect: PrismaSelect<'UserSettings'>,
  ) {
    const userSettings = await this.userSettingsService.findUnique({
      where: {
        id: args.where.id,
      },
      select: prismaSelect.value,
    });
    assert(userSettings, 'UserSettings not found');
    return this.userSettingsService.update({
      where: args.where,
      data: args.data,
      select: prismaSelect.value,
    } as Prisma.UserSettingsUpdateArgs);
  }
}
