import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { Logger, UseGuards } from '@nestjs/common';

import { User } from '@prisma/client';

import { UserSettings } from 'src/core/@generated/user-settings/user-settings.model';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { UpdateUserSettingsAbilityHandler } from 'src/ability/handlers/user-settings.ability-handler';
import { CheckAbilities } from 'src/decorators/check-abilities.decorator';
import { AbilityGuard } from 'src/guards/ability.guard';
import { UpdateOneUserSettingsArgs } from 'src/core/@generated/user-settings/update-one-user-settings.args';
import {
  PrismaSelect,
  PrismaSelector,
} from 'src/decorators/prisma-select.decorator';
import { AuthUser } from 'src/decorators/auth-user.decorator';

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
    @AuthUser() { id }: User,
  ) {
    Logger.log('I am here');
    // @Args() args: UpdateOneUserSettingsArgs, // , //, //

    //  //  // , // ,
    // console.log('I am here', { args, prismaSelect });
    // const user = await this.userSettingsService.findUnique({
    //   where: {
    //     id,
    //   },
    //   select: prismaSelect.value,
    // });
    // assert(user, 'UserSettings not found');
    // return this.userSettingsService.update({
    //   where: args.where,
    //   data: args.data,
    //   select: prismaSelect.value,
    // } as Prisma.UserSettingsUpdateArgs);
    return {
      id: '123',
    };
  }
}
