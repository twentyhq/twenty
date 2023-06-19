import { PrismaService } from 'src/database/prisma.service';
import { AbilityAction } from '../ability.action';
import { AppAbility } from '../ability.factory';
import { IAbilityHandler } from '../interfaces/ability-handler.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ManageCommentAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility) {
    return ability.can(AbilityAction.Manage, 'Comment');
  }
}

@Injectable()
export class ReadCommentAbilityHandler implements IAbilityHandler {
  handle(ability: AppAbility) {
    return ability.can(AbilityAction.Read, 'Comment');
  }
}

@Injectable()
export class CreateCommentAbilityHandler implements IAbilityHandler {
  handle(ability: AppAbility) {
    return ability.can(AbilityAction.Create, 'Comment');
  }
}

@Injectable()
export class UpdateCommentAbilityHandler implements IAbilityHandler {
  handle(ability: AppAbility) {
    return ability.can(AbilityAction.Update, 'Comment');
  }
}

@Injectable()
export class DeleteCommentAbilityHandler implements IAbilityHandler {
  handle(ability: AppAbility) {
    return ability.can(AbilityAction.Delete, 'Comment');
  }
}
