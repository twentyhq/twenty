import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { accessibleBy } from '@casl/prisma';
import { Prisma, Workspace } from '@prisma/client';

import { AppAbility } from 'src/ability/ability.factory';
import {
  CreateViewAbilityHandler,
  DeleteViewAbilityHandler,
  ReadViewAbilityHandler,
  UpdateViewAbilityHandler,
} from 'src/ability/handlers/view.ability-handler';
import { AffectedRows } from 'src/core/@generated/prisma/affected-rows.output';
import { CreateManyViewArgs } from 'src/core/@generated/view/create-many-view.args';
import { CreateOneViewArgs } from 'src/core/@generated/view/create-one-view.args';
import { DeleteManyViewArgs } from 'src/core/@generated/view/delete-many-view.args';
import { DeleteOneViewArgs } from 'src/core/@generated/view/delete-one-view.args';
import { FindManyViewArgs } from 'src/core/@generated/view/find-many-view.args';
import { UpdateOneViewArgs } from 'src/core/@generated/view/update-one-view.args';
import { View } from 'src/core/@generated/view/view.model';
import { ViewService } from 'src/core/view/services/view.service';
import { AuthWorkspace } from 'src/decorators/auth-workspace.decorator';
import { CheckAbilities } from 'src/decorators/check-abilities.decorator';
import {
  PrismaSelect,
  PrismaSelector,
} from 'src/decorators/prisma-select.decorator';
import { UserAbility } from 'src/decorators/user-ability.decorator';
import { AbilityGuard } from 'src/guards/ability.guard';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';

@UseGuards(JwtAuthGuard)
@Resolver(() => View)
export class ViewResolver {
  constructor(private readonly viewService: ViewService) {}

  @Mutation(() => View, {
    nullable: false,
  })
  @UseGuards(AbilityGuard)
  @CheckAbilities(CreateViewAbilityHandler)
  async createOneView(
    @Args() args: CreateOneViewArgs,
    @AuthWorkspace() workspace: Workspace,
    @PrismaSelector({ modelName: 'View' })
    prismaSelect: PrismaSelect<'View'>,
  ): Promise<Partial<View>> {
    return this.viewService.create({
      data: {
        ...args.data,
        workspace: { connect: { id: workspace.id } },
      },
      select: prismaSelect.value,
    } as Prisma.ViewCreateArgs);
  }

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

  @Mutation(() => View, {
    nullable: false,
  })
  @UseGuards(AbilityGuard)
  @CheckAbilities(DeleteViewAbilityHandler)
  async deleteOneView(
    @Args() args: DeleteOneViewArgs,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<View> {
    const viewToDelete = await this.viewService.findUnique({
      where: args.where,
    });

    if (!viewToDelete) {
      throw new NotFoundException();
    }

    const { objectId } = viewToDelete;

    const viewsNb = await this.viewService.count({
      where: {
        objectId: { equals: objectId },
        workspaceId: { equals: workspace.id },
      },
    });

    if (viewsNb <= 1) {
      throw new ForbiddenException(
        `Deleting last '${objectId}' view is not allowed`,
      );
    }

    return this.viewService.delete({
      where: args.where,
    });
  }

  @Mutation(() => AffectedRows, {
    nullable: false,
  })
  @UseGuards(AbilityGuard)
  @CheckAbilities(DeleteViewAbilityHandler)
  async deleteManyView(
    @Args() args: DeleteManyViewArgs,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<AffectedRows> {
    const viewsToDelete = await this.viewService.findMany({
      where: args.where,
    });

    if (!viewsToDelete.length) return { count: 0 };

    const { objectId } = viewsToDelete[0];

    if (viewsToDelete.some((view) => view.objectId !== objectId)) {
      throw new BadRequestException(
        `Views must have the same objectId '${objectId}'`,
      );
    }

    const viewsNb = await this.viewService.count({
      where: {
        objectId: { equals: objectId },
        workspaceId: { equals: workspace.id },
      },
    });

    if (viewsNb - viewsToDelete.length <= 0) {
      throw new ForbiddenException(
        `Deleting last '${objectId}' view is not allowed`,
      );
    }

    return this.viewService.deleteMany({
      where: args.where,
    });
  }
}
