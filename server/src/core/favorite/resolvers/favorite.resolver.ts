import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { InputType } from '@nestjs/graphql';
import { Field } from '@nestjs/graphql';

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
  DeleteFavoriteAbilityHandler,
  ReadFavoriteAbilityHandler,
  UpdateFavoriteAbilityHandler,
} from 'src/ability/handlers/favorite.ability-handler';
import { AuthWorkspace } from 'src/decorators/auth-workspace.decorator';
import { FavoriteService } from 'src/core/favorite/services/favorite.service';
import { FavoriteWhereInput } from 'src/core/@generated/favorite/favorite-where.input';
import { SortOrder } from 'src/core/@generated/prisma/sort-order.enum';
import { UpdateOneFavoriteArgs } from 'src/core/@generated/favorite/update-one-favorite.args';

@InputType()
class FavoriteMutationForPersonArgs {
  @Field(() => String)
  personId: string;
  @Field(() => Number)
  position: number;
}

@InputType()
class FavoriteMutationForCompanyArgs {
  @Field(() => String)
  companyId: string;
  @Field(() => Number)
  position: number;
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
      orderBy: [{ position: SortOrder.asc }],
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
        position: args.position,
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
        position: args.position,
      },
      select: prismaSelect.value,
    });
  }

  @Mutation(() => Favorite, {
    nullable: false,
  })
  @UseGuards(AbilityGuard)
  @CheckAbilities(UpdateFavoriteAbilityHandler)
  async updateOneFavorites(
    @Args() args: UpdateOneFavoriteArgs,
    @PrismaSelector({ modelName: 'Favorite' })
    prismaSelect: PrismaSelect<'Favorite'>,
  ): Promise<Partial<Favorite>> {
    return this.favoriteService.update({
      data: args.data,
      where: args.where,
      select: prismaSelect.value,
    } as Prisma.FavoriteUpdateArgs);
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
