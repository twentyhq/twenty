import { PrismaService } from 'src/database/prisma.service';
import { AbilityAction } from '../ability.action';
import { AppAbility } from '../ability.factory';
import { IAbilityHandler } from '../interfaces/ability-handler.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ManageCompanyAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility) {
    return ability.can(AbilityAction.Manage, 'Company');
  }
}

@Injectable()
export class ReadCompanyAbilityHandler implements IAbilityHandler {
  handle(ability: AppAbility) {
    return ability.can(AbilityAction.Read, 'Company');
  }
}

@Injectable()
export class CreateCompanyAbilityHandler implements IAbilityHandler {
  handle(ability: AppAbility) {
    return ability.can(AbilityAction.Create, 'Company');
  }
}

@Injectable()
export class UpdateCompanyAbilityHandler implements IAbilityHandler {
  handle(ability: AppAbility) {
    return ability.can(AbilityAction.Update, 'Company');
  }
}

@Injectable()
export class DeleteCompanyAbilityHandler implements IAbilityHandler {
  handle(ability: AppAbility) {
    return ability.can(AbilityAction.Delete, 'Company');
  }
}
