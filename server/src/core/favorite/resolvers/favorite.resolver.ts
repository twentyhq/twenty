import { Resolver, Query, Args, Mutation, ObjectType, ID } from '@nestjs/graphql';
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
  DeleteFavoriteAbilityHandler,
  ReadFavoriteAbilityHandler,
} from 'src/ability/handlers/favorite.ability-handler';
import { AuthWorkspace } from 'src/decorators/auth-workspace.decorator';
import { FavoriteService } from 'src/core/favorite/services/favorite.service';
import { UserAbility } from 'src/decorators/user-ability.decorator';
import { AppAbility } from 'src/ability/ability.factory';
import { InputType } from '@nestjs/graphql';
import { Field } from '@nestjs/graphql';
import { FavoriteWhereInput } from 'src/core/@generated/favorite/favorite-where.input';

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
      include: {
        person: true,
        company: {
          include: {
            accountOwner: true,
          }
        },
      },
    });

    return favorites
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

    if(favorite) return favorite

    return this.favoriteService.create({
      data: {
        person: {
          connect: { id: args.personId }
        }, 
        workspaceId: workspace.id
      },
      select: prismaSelect.value
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

    if(favorite) return favorite

    return this.favoriteService.create({
      data: {
        company: {
          connect: { id: args.companyId }
        }, 
        workspaceId: workspace.id
      },
      select: prismaSelect.value
    });
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
      select: prismaSelect.value
    })
  }
}