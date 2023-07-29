import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import {
    PrismaSelect,
    PrismaSelector,
  } from 'src/decorators/prisma-select.decorator';

import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { Favorite } from 'src/core/@generated/favorite/favorite.model';
import { FindManyFavoriteArgs } from 'src/core/@generated/favorite/find-many-favorite.args';

import { FavoriteService } from '../services/favorite.service';
import { AbilityGuard } from 'src/guards/ability.guard';
import { UserAbility } from 'src/decorators/user-ability.decorator';
import { AppAbility } from 'src/ability/ability.factory';
import { CheckAbilities } from 'src/decorators/check-abilities.decorator';
import { ReadFavoriteAbilityHandler } from 'src/ability/handlers/favorite.ability-handler';

@UseGuards(JwtAuthGuard)
@Resolver(() => Favorite)
export class FavoriteResolver {
    constructor(private readonly favoriteService: FavoriteService) {}

    @Query(() => [Favorite])
    @UseGuards(AbilityGuard)
    @CheckAbilities(ReadFavoriteAbilityHandler)
    async findFavorites(
        @Args('id') id: string,
        @UserAbility() ability: AppAbility,
        @PrismaSelector({ modelName: 'Favorite' })
        prismaSelect: PrismaSelect<'Favorite'>,
    ): Promise<Partial<Favorite>[]>{
        return this.favoriteService.findMany({
            where: {
                id: id,
            },
            select: prismaSelect.value,
        });
    }
}
