import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { accessibleBy } from '@casl/prisma';
import { Prisma, Workspace } from '@prisma/client';

import { AppAbility } from 'src/ability/ability.factory';
import {
  CreateViewAbilityHandler,
  ReadViewAbilityHandler,
  UpdateViewAbilityHandler,
} from 'src/ability/handlers/view.ability-handler';
import { FindManyViewArgs } from 'src/core/@generated/view/find-many-view.args';
import { View } from 'src/core/@generated/view/view.model';
import { ViewService } from 'src/core/view/services/view.service';
import { CheckAbilities } from 'src/decorators/check-abilities.decorator';
import {
  PrismaSelect,
  PrismaSelector,
} from 'src/decorators/prisma-select.decorator';
import { UserAbility } from 'src/decorators/user-ability.decorator';
import { AbilityGuard } from 'src/guards/ability.guard';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { UpdateOneViewArgs } from 'src/core/@generated/view/update-one-view.args';
import { AuthWorkspace } from 'src/decorators/auth-workspace.decorator';
import { AffectedRows } from 'src/core/@generated/prisma/affected-rows.output';
import { CreateManyViewArgs } from 'src/core/@generated/view/create-many-view.args';

@UseGuards(JwtAuthGuard)
@Resolver(() => View)
export class ViewResolver {
  constructor(private readonly viewService: ViewService) {}

  @Mutation(() => AffectedRows)
  @UseGuards(AbilityGuard)
  @CheckAbilities(CreateViewAbilityHandler)
  async createManyView(
    @Args() args: CreateManyViewArgs,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<AffectedRows> {
    return this.viewService.createMany({
      data: args.data.map((data) => ({
        ...data,
        workspaceId: workspace.id,
      })),
    });
  }

  @Query(() => [View])
  @UseGuards(AbilityGuard)
  @CheckAbilities(ReadViewAbilityHandler)
  async findManyView(
    @Args() args: FindManyViewArgs,
    @UserAbility() ability: AppAbility,
    @PrismaSelector({ modelName: 'View' })
    prismaSelect: PrismaSelect<'View'>,
  ): Promise<Partial<View>[]> {
    return this.viewService.findMany({
      where: args.where
        ? {
            AND: [args.where, accessibleBy(ability).View],
          }
        : accessibleBy(ability).View,
      orderBy: args.orderBy,
      cursor: args.cursor,
      take: args.take,
      skip: args.skip,
      distinct: args.distinct,
      select: prismaSelect.value,
    });
  }

  @Mutation(() => View)
  @UseGuards(AbilityGuard)
  @CheckAbilities(UpdateViewAbilityHandler)
  async updateOneView(
    @Args() args: UpdateOneViewArgs,
    @PrismaSelector({ modelName: 'View' })
    prismaSelect: PrismaSelect<'View'>,
  ): Promise<Partial<View>> {
    return this.viewService.update({
      data: args.data,
      where: args.where,
      select: prismaSelect.value,
    } as Prisma.ViewUpdateArgs);
  }
}
