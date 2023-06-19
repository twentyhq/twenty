import { PrismaService } from 'src/database/prisma.service';
import { AbilityAction } from '../ability.action';
import { AppAbility } from '../ability.factory';
import { IAbilityHandler } from '../interfaces/ability-handler.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ManagePipelineProgressAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility) {
    return ability.can(AbilityAction.Manage, 'PipelineProgress');
  }
}

@Injectable()
export class ReadPipelineProgressAbilityHandler implements IAbilityHandler {
  handle(ability: AppAbility) {
    return ability.can(AbilityAction.Read, 'PipelineProgress');
  }
}

@Injectable()
export class CreatePipelineProgressAbilityHandler implements IAbilityHandler {
  handle(ability: AppAbility) {
    return ability.can(AbilityAction.Create, 'PipelineProgress');
  }
}

@Injectable()
export class UpdatePipelineProgressAbilityHandler implements IAbilityHandler {
  handle(ability: AppAbility) {
    return ability.can(AbilityAction.Update, 'PipelineProgress');
  }
}

@Injectable()
export class DeletePipelineProgressAbilityHandler implements IAbilityHandler {
  handle(ability: AppAbility) {
    return ability.can(AbilityAction.Delete, 'PipelineProgress');
  }
}
