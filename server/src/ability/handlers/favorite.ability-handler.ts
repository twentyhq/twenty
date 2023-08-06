import {
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { subject } from '@casl/ability';

import { IAbilityHandler } from 'src/ability/interfaces/ability-handler.interface';

import { PrismaService } from 'src/database/prisma.service';
import { AbilityAction } from 'src/ability/ability.action';
import { AppAbility } from 'src/ability/ability.factory';
import { relationAbilityChecker } from 'src/ability/ability.util';
import { FavoriteWhereInput } from 'src/core/@generated/favorite/favorite-where.input';
import { assert } from 'src/utils/assert';

class FavoriteArgs {
  where?: FavoriteWhereInput;
}

@Injectable()
export class ManageFavoriteAbilityHandler implements IAbilityHandler {
  async handle(ability: AppAbility) {
    return ability.can(AbilityAction.Manage, 'Favorite');
  }
}

@Injectable()
export class ReadFavoriteAbilityHandler implements IAbilityHandler {
  handle(ability: AppAbility) {
    return ability.can(AbilityAction.Read, 'Favorite');
  }
}

@Injectable()
export class CreateFavoriteAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs();

    const allowed = await relationAbilityChecker(
      'Favorite',
      ability,
      this.prismaService.client,
      args,
    );

    if (!allowed) {
      return false;
    }

    return ability.can(AbilityAction.Create, 'Favorite');
  }
}

@Injectable()
export class DeleteFavoriteAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs<FavoriteArgs>();
    const favorite = await this.prismaService.client.favorite.findFirst({
      where: args.where,
    });
    assert(favorite, '', NotFoundException);

    return ability.can(AbilityAction.Delete, subject('Favorite', favorite));
  }
}
