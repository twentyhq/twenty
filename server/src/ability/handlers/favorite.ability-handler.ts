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
import { CompanyWhereInput } from 'src/core/@generated/company/company-where.input';
import { relationAbilityChecker } from 'src/ability/ability.util';
import { assert } from 'src/utils/assert';

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
