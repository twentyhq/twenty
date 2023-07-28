import { Resolver, Args, Mutation } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';


import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { Favorite } from 'src/core/@generated/favorite/favorite.model';
import { FavoriteService } from '../services/favorite.service';

@UseGuards(JwtAuthGuard)
@Resolver(() => Comment)
export class FavoriteResolver {
    constructor(private readonly favoriteService: FavoriteService) {}

    //@Query(() => [Favorite])
    //@UseGuards(AbilityGuard)
    //@CheckAbilities(ReadCompanyAbilityHandler)
}
