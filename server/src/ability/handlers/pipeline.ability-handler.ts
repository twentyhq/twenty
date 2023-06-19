import { PrismaService } from 'src/database/prisma.service';
import { AbilityAction } from '../ability.action';
import { AppAbility } from '../ability.factory';
import { IAbilityHandler } from '../interfaces/ability-handler.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ManagePipelineAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility) {
    return ability.can(AbilityAction.Manage, 'Pipeline');
  }
}

@Injectable()
export class ReadPipelineAbilityHandler implements IAbilityHandler {
  handle(ability: AppAbility) {
    return ability.can(AbilityAction.Read, 'Pipeline');
  }
}

@Injectable()
export class CreatePipelineAbilityHandler implements IAbilityHandler {
  handle(ability: AppAbility) {
    return ability.can(AbilityAction.Create, 'Pipeline');
  }
}

@Injectable()
export class UpdatePipelineAbilityHandler implements IAbilityHandler {
  handle(ability: AppAbility) {
    return ability.can(AbilityAction.Update, 'Pipeline');
  }
}

@Injectable()
export class DeletePipelineAbilityHandler implements IAbilityHandler {
  handle(ability: AppAbility) {
    return ability.can(AbilityAction.Delete, 'Pipeline');
  }
}
