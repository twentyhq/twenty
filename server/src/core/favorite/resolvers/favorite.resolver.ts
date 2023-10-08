import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { NotFoundException, UseGuards } from '@nestjs/common';
import { InputType } from '@nestjs/graphql';
import { Field } from '@nestjs/graphql';

import { Workspace } from '@prisma/client';

import {
  PrismaSelect,
  PrismaSelector,
} from 'src/decorators/prisma-select.decorator';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { Favorite } from 'src/core/@generated/favorite/favorite.model';
import { AbilityGuard } from 'src/guards/ability.guard';
import { CheckAbilities } from 'src/decorators/check-abilities.decorator';
import {
  CreateFavoriteAbilityHandler,
  DeleteFavoriteAbilityHandler,
  ReadFavoriteAbilityHandler,
} from 'src/ability/handlers/favorite.ability-handler';
import { AuthWorkspace } from 'src/decorators/auth-workspace.decorator';
import { FavoriteService } from 'src/core/favorite/services/favorite.service';
import { FavoriteWhereInput } from 'src/core/@generated/favorite/favorite-where.input';
import { assert } from 'src/utils/assert';

@InputType()
class FavoriteMutationForPersonArgs {
  @Field(() => String)
  personId: string;
}

@InputType()
class FavoriteMutationForCompanyArgs {
  @Field(() => String)
  companyId: string;
}

@InputType()
class FavoriteMutationForUpdatingOrder {
  @Field(() => String)
  favoriteId: string;

  @Field(() => Number)
  toIndex: number;
}

@UseGuards(JwtAuthGuard)
@Resolver(() => Favorite)
export class FavoriteResolver {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Query(() => [Favorite])
  @UseGuards(AbilityGuard)
  @CheckAbilities(ReadFavoriteAbilityHandler)
  async findFavorites(
    @AuthWorkspace() workspace: Workspace,
  ): Promise<Partial<Favorite>[]> {
    const favorites = await this.favoriteService.findMany({
      where: {
        workspaceId: workspace.id,
      },
      include: {
        person: true,
        company: {
          include: {
            accountOwner: true,
          },
        },
      },
    });

    return favorites;
  }

  @Mutation(() => Favorite, {
    nullable: false,
  })
  @UseGuards(AbilityGuard)
  @CheckAbilities(CreateFavoriteAbilityHandler)
  async createFavoriteForPerson(
    @Args('data') args: FavoriteMutationForPersonArgs,
    @AuthWorkspace() workspace: Workspace,
    @PrismaSelector({ modelName: 'Favorite' })
    prismaSelect: PrismaSelect<'Favorite'>,
  ): Promise<Partial<Favorite>> {
    //To avoid duplicates we first fetch all favorites assinged by workspace
    const favorite = await this.favoriteService.findFirst({
      where: { workspaceId: workspace.id, personId: args.personId },
    });

    if (favorite) return favorite;

    return this.favoriteService.create({
      data: {
        person: {
          connect: { id: args.personId },
        },
        workspaceId: workspace.id,
      },
      select: prismaSelect.value,
    });
  }

  @Mutation(() => Favorite, {
    nullable: false,
  })
  @UseGuards(AbilityGuard)
  @CheckAbilities(CreateFavoriteAbilityHandler)
  async createFavoriteForCompany(
    @Args('data') args: FavoriteMutationForCompanyArgs,
    @AuthWorkspace() workspace: Workspace,
    @PrismaSelector({ modelName: 'Favorite' })
    prismaSelect: PrismaSelect<'Favorite'>,
  ): Promise<Partial<Favorite>> {
    //To avoid duplicates we first fetch all favorites assinged by workspace
    const favorite = await this.favoriteService.findFirst({
      where: { workspaceId: workspace.id, companyId: args.companyId },
    });

    if (favorite) return favorite;

    return this.favoriteService.create({
      data: {
        company: {
          connect: { id: args.companyId },
        },
        workspaceId: workspace.id,
      },
      select: prismaSelect.value,
    });
  }

  @Mutation(() => Boolean, {
    nullable: false,
  })
  @UseGuards(AbilityGuard)
  @CheckAbilities(CreateFavoriteAbilityHandler)
  async updateFavoritesOrder(
    @Args('data') args: FavoriteMutationForUpdatingOrder,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<boolean> {
    const { favoriteId, toIndex } = args;

    const allFavorites = await this.favoriteService.findMany({
      where: {
        workspaceId: workspace.id,
      },
      include: {
        person: true,
        company: {
          include: {
            accountOwner: true,
          },
        },
      },
    });
    const currentIndex = allFavorites.findIndex(
      (favorite) => favorite.id === favoriteId,
    );

    assert(
      currentIndex !== -1,
      'Favorite Item with this Id not found',
      NotFoundException,
    );
    // Remove 'favoriteId' favorite from its current position
    const FavoriteItemToReorder = allFavorites.splice(currentIndex, 1)[0];

    // Insert 'favoriteId' favorite at the 'toIndex'
    allFavorites.splice(toIndex, 0, FavoriteItemToReorder);
    // Delete all old favorites
    await this.favoriteService.deleteMany({
      where: { workspaceId: workspace.id },
    });

    const updatedFavoritesData = allFavorites.map((favorite) => ({
      workspaceId: workspace.id,
      ...(favorite?.personId ? { personId: favorite.personId } : {}),
      ...(favorite?.companyId ? { companyId: favorite.companyId } : {}),
    }));

    await this.favoriteService.createMany({
      data: updatedFavoritesData,
    });

    return true;
  }

  @Mutation(() => Favorite, {
    nullable: false,
  })
  @UseGuards(AbilityGuard)
  @CheckAbilities(DeleteFavoriteAbilityHandler)
  async deleteFavorite(
    @Args('where') args: FavoriteWhereInput,
    @AuthWorkspace() workspace: Workspace,
    @PrismaSelector({ modelName: 'Favorite' })
    prismaSelect: PrismaSelect<'Favorite'>,
  ): Promise<Partial<Favorite>> {
    const favorite = await this.favoriteService.findFirst({
      where: { ...args, workspaceId: workspace.id },
    });

    return this.favoriteService.delete({
      where: { id: favorite?.id },
      select: prismaSelect.value,
    });
  }
}
