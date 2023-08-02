import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { Prisma, Workspace } from '@prisma/client';

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
  ReadFavoriteAbilityHandler,
} from 'src/ability/handlers/favorite.ability-handler';
import { AuthWorkspace } from 'src/decorators/auth-workspace.decorator';
import { CreateManyFavoriteArgs } from 'src/core/@generated/favorite/create-many-favorite.args';
import { FavoriteCreateManyInput } from 'src/core/@generated/favorite/favorite-create-many.input';
import { FavoriteService } from 'src/core/favorite/services/favorite.service';
import { UserAbility } from 'src/decorators/user-ability.decorator';
import { AppAbility } from 'src/ability/ability.factory';

@UseGuards(JwtAuthGuard)
@Resolver(() => Favorite)
export class FavoriteResolver {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Query(() => [Favorite])
  @UseGuards(AbilityGuard)
  @CheckAbilities(ReadFavoriteAbilityHandler)
  async findFavorites(
    @AuthWorkspace() workspace: Workspace,
    @UserAbility() ability: AppAbility,
    @PrismaSelector({ modelName: 'Favorite' })
    prismaSelect: PrismaSelect<'Favorite'>,
  ): Promise<Partial<Favorite>[]> {
    const favorites = await this.favoriteService.findMany({
      where: {
        workspaceId: workspace.id,
      },
      select: prismaSelect.value,
    });

    return favorites
  }

  @Mutation(() => [Favorite], {
    nullable: false,
  })
  @UseGuards(AbilityGuard)
  @CheckAbilities(CreateFavoriteAbilityHandler)
  async createFavorites(
    @Args() args: CreateManyFavoriteArgs,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<Prisma.BatchPayload> {
    //To avoid duplicates we first fetch all favorites assinged by workspace
    const favorites = await this.favoriteService.findMany({
      where: { workspaceId: workspace.id },
      select: { companyId: true, personId: true },
    });

    //we create a set for both people and companies
    const favorite_persons = new Set(favorites.map((fav) => fav.personId));
    const favorite_companies = new Set(favorites.map((fav) => fav.companyId));

    const uniquePeople: FavoriteCreateManyInput[] = [];
    const uniqueCompanies: FavoriteCreateManyInput[] = [];

    args.data.forEach((favorite) => {
      favorite.workspaceId = workspace.id;
      //we dont know if a favorite is a person or company, so we check for both
      if (favorite.personId) {
        //if person is not in favorites then add to favorites
        if (!favorite_persons.has(favorite.personId))
          uniquePeople.push(favorite);
          //if company is not in favorites then add to favorites
      } else if (favorite.companyId) {
        if (!favorite_companies.has(favorite.companyId))
          uniqueCompanies.push(favorite);
      }
    });

    const created_favorites = await this.favoriteService.createMany({
      data: [...uniquePeople, ...uniqueCompanies],
      skipDuplicates: true,
    });

    return created_favorites;
  }
}
