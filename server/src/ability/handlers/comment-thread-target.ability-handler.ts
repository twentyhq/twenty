import { PrismaService } from 'src/database/prisma.service';
import { AbilityAction } from '../ability.action';
import { AppAbility } from '../ability.factory';
import { IAbilityHandler } from '../interfaces/ability-handler.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ManageCommentThreadTargetAbilityHandler
  implements IAbilityHandler
{
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility) {
    return ability.can(AbilityAction.Manage, 'CommentThreadTarget');
  }
}

@Injectable()
export class ReadCommentThreadTargetAbilityHandler implements IAbilityHandler {
  handle(ability: AppAbility) {
    return ability.can(AbilityAction.Read, 'CommentThreadTarget');
  }
}

@Injectable()
export class CreateCommentThreadTargetAbilityHandler
  implements IAbilityHandler
{
  handle(ability: AppAbility) {
    return ability.can(AbilityAction.Create, 'CommentThreadTarget');
  }
}

@Injectable()
export class UpdateCommentThreadTargetAbilityHandler
  implements IAbilityHandler
{
  handle(ability: AppAbility) {
    return ability.can(AbilityAction.Update, 'CommentThreadTarget');
  }
}

@Injectable()
export class DeleteCommentThreadTargetAbilityHandler
  implements IAbilityHandler
{
  handle(ability: AppAbility) {
    return ability.can(AbilityAction.Delete, 'CommentThreadTarget');
  }
}
