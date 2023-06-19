import { PrismaService } from 'src/database/prisma.service';
import { AbilityAction } from '../ability.action';
import { AppAbility } from '../ability.factory';
import { IAbilityHandler } from '../interfaces/ability-handler.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ManageRefreshTokenAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility) {
    return ability.can(AbilityAction.Manage, 'RefreshToken');
  }
}

@Injectable()
export class ReadRefreshTokenAbilityHandler implements IAbilityHandler {
  handle(ability: AppAbility) {
    return ability.can(AbilityAction.Read, 'RefreshToken');
  }
}

@Injectable()
export class CreateRefreshTokenAbilityHandler implements IAbilityHandler {
  handle(ability: AppAbility) {
    return ability.can(AbilityAction.Create, 'RefreshToken');
  }
}

@Injectable()
export class UpdateRefreshTokenAbilityHandler implements IAbilityHandler {
  handle(ability: AppAbility) {
    return ability.can(AbilityAction.Update, 'RefreshToken');
  }
}

@Injectable()
export class DeleteRefreshTokenAbilityHandler implements IAbilityHandler {
  handle(ability: AppAbility) {
    return ability.can(AbilityAction.Delete, 'RefreshToken');
  }
}
