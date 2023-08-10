import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { accessibleBy } from '@casl/prisma';
import { Prisma, Workspace } from '@prisma/client';

import { AppAbility } from 'src/ability/ability.factory';
import {
  CreateViewSortAbilityHandler,
  DeleteViewSortAbilityHandler,
  ReadViewSortAbilityHandler,
  UpdateViewSortAbilityHandler,
} from 'src/ability/handlers/view-sort.ability-handler';
import { FindManyViewSortArgs } from 'src/core/@generated/view-sort/find-many-view-sort.args';
import { ViewSort } from 'src/core/@generated/view-sort/view-sort.model';
import { ViewSortService } from 'src/core/view/services/view-sort.service';
import { CheckAbilities } from 'src/decorators/check-abilities.decorator';
import {
  PrismaSelect,
  PrismaSelector,
} from 'src/decorators/prisma-select.decorator';
import { UserAbility } from 'src/decorators/user-ability.decorator';
import { AbilityGuard } from 'src/guards/ability.guard';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { UpdateOneViewSortArgs } from 'src/core/@generated/view-sort/update-one-view-sort.args';
import { AuthWorkspace } from 'src/decorators/auth-workspace.decorator';
import { AffectedRows } from 'src/core/@generated/prisma/affected-rows.output';
import { DeleteManyViewSortArgs } from 'src/core/@generated/view-sort/delete-many-view-sort.args';
import { CreateManyViewSortArgs } from 'src/core/@generated/view-sort/create-many-view-sort.args';

@UseGuards(JwtAuthGuard)
@Resolver(() => ViewSort)
export class ViewSortResolver {
  constructor(private readonly viewSortService: ViewSortService) {}

  @Mutation(() => AffectedRows)
  @UseGuards(AbilityGuard)
  @CheckAbilities(CreateViewSortAbilityHandler)
  async createManyViewSort(
    @Args() args: CreateManyViewSortArgs,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<AffectedRows> {
    return this.viewSortService.createMany({
      data: args.data.map((data) => ({
        ...data,
        workspaceId: workspace.id,
      })),
    });
  }

  @Query(() => [ViewSort])
  @UseGuards(AbilityGuard)
  @CheckAbilities(ReadViewSortAbilityHandler)
  async findManyViewSort(
    @Args() args: FindManyViewSortArgs,
    @UserAbility() ability: AppAbility,
    @PrismaSelector({ modelName: 'ViewSort' })
    prismaSelect: PrismaSelect<'ViewSort'>,
  ): Promise<Partial<ViewSort>[]> {
    return this.viewSortService.findMany({
      where: args.where
        ? {
            AND: [args.where, accessibleBy(ability).ViewSort],
          }
        : accessibleBy(ability).ViewSort,
      orderBy: args.orderBy,
      cursor: args.cursor,
      take: args.take,
      skip: args.skip,
      distinct: args.distinct,
      select: prismaSelect.value,
    });
  }

  @Mutation(() => ViewSort)
  @UseGuards(AbilityGuard)
  @CheckAbilities(UpdateViewSortAbilityHandler)
  async updateOneViewSort(
    @Args() args: UpdateOneViewSortArgs,
    @PrismaSelector({ modelName: 'ViewSort' })
    prismaSelect: PrismaSelect<'ViewSort'>,
  ): Promise<Partial<ViewSort>> {
    return this.viewSortService.update({
      data: args.data,
      where: args.where,
      select: prismaSelect.value,
    } as Prisma.ViewSortUpdateArgs);
  }

  @Mutation(() => AffectedRows, {
    nullable: false,
  })
  @UseGuards(AbilityGuard)
  @CheckAbilities(DeleteViewSortAbilityHandler)
  async deleteManyViewSort(
    @Args() args: DeleteManyViewSortArgs,
  ): Promise<AffectedRows> {
    return this.viewSortService.deleteMany({
      where: args.where,
    });
  }
}
