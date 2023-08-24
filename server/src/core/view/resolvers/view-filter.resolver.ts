import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { accessibleBy } from '@casl/prisma';
import { Prisma, Workspace } from '@prisma/client';

import { AppAbility } from 'src/ability/ability.factory';
import {
  CreateViewFilterAbilityHandler,
  DeleteViewFilterAbilityHandler,
  ReadViewFilterAbilityHandler,
  UpdateViewFilterAbilityHandler,
} from 'src/ability/handlers/view-filter.ability-handler';
import { FindManyViewFilterArgs } from 'src/core/@generated/view-filter/find-many-view-filter.args';
import { ViewFilter } from 'src/core/@generated/view-filter/view-filter.model';
import { ViewFilterService } from 'src/core/view/services/view-filter.service';
import { CheckAbilities } from 'src/decorators/check-abilities.decorator';
import {
  PrismaSelect,
  PrismaSelector,
} from 'src/decorators/prisma-select.decorator';
import { UserAbility } from 'src/decorators/user-ability.decorator';
import { AbilityGuard } from 'src/guards/ability.guard';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { UpdateOneViewFilterArgs } from 'src/core/@generated/view-filter/update-one-view-filter.args';
import { AuthWorkspace } from 'src/decorators/auth-workspace.decorator';
import { AffectedRows } from 'src/core/@generated/prisma/affected-rows.output';
import { DeleteManyViewFilterArgs } from 'src/core/@generated/view-filter/delete-many-view-filter.args';
import { CreateManyViewFilterArgs } from 'src/core/@generated/view-filter/create-many-view-filter.args';

@UseGuards(JwtAuthGuard)
@Resolver(() => ViewFilter)
export class ViewFilterResolver {
  constructor(private readonly viewFilterService: ViewFilterService) {}

  @Mutation(() => AffectedRows)
  @UseGuards(AbilityGuard)
  @CheckAbilities(CreateViewFilterAbilityHandler)
  async createManyViewFilter(
    @Args() args: CreateManyViewFilterArgs,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<AffectedRows> {
    return this.viewFilterService.createMany({
      data: args.data.map((data) => ({
        ...data,
        workspaceId: workspace.id,
      })),
    });
  }

  @Query(() => [ViewFilter])
  @UseGuards(AbilityGuard)
  @CheckAbilities(ReadViewFilterAbilityHandler)
  async findManyViewFilter(
    @Args() args: FindManyViewFilterArgs,
    @UserAbility() ability: AppAbility,
    @PrismaSelector({ modelName: 'ViewFilter' })
    prismaSelect: PrismaSelect<'ViewFilter'>,
  ): Promise<Partial<ViewFilter>[]> {
    return this.viewFilterService.findMany({
      where: args.where
        ? {
            AND: [args.where, accessibleBy(ability).ViewFilter],
          }
        : accessibleBy(ability).ViewFilter,
      orderBy: args.orderBy,
      cursor: args.cursor,
      take: args.take,
      skip: args.skip,
      distinct: args.distinct,
      select: prismaSelect.value,
    });
  }

  @Mutation(() => ViewFilter)
  @UseGuards(AbilityGuard)
  @CheckAbilities(UpdateViewFilterAbilityHandler)
  async updateOneViewFilter(
    @Args() args: UpdateOneViewFilterArgs,
    @PrismaSelector({ modelName: 'ViewFilter' })
    prismaSelect: PrismaSelect<'ViewFilter'>,
  ): Promise<Partial<ViewFilter>> {
    return this.viewFilterService.update({
      data: args.data,
      where: args.where,
      select: prismaSelect.value,
    } as Prisma.ViewFilterUpdateArgs);
  }

  @Mutation(() => AffectedRows, {
    nullable: false,
  })
  @UseGuards(AbilityGuard)
  @CheckAbilities(DeleteViewFilterAbilityHandler)
  async deleteManyViewFilter(
    @Args() args: DeleteManyViewFilterArgs,
  ): Promise<AffectedRows> {
    return this.viewFilterService.deleteMany({
      where: args.where,
    });
  }
}
