import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { subject } from '@casl/ability';

import { IAbilityHandler } from 'src/ability/interfaces/ability-handler.interface';

import { PrismaService } from 'src/database/prisma.service';
import { AbilityAction } from 'src/ability/ability.action';
import { AppAbility } from 'src/ability/ability.factory';
import { assert } from 'src/utils/assert';

class AttachmentArgs {
  activityId?: string;
}

@Injectable()
export class ManageAttachmentAbilityHandler implements IAbilityHandler {
  async handle(ability: AppAbility) {
    return ability.can(AbilityAction.Manage, 'Attachment');
  }
}

@Injectable()
export class ReadAttachmentAbilityHandler implements IAbilityHandler {
  handle(ability: AppAbility) {
    return ability.can(AbilityAction.Read, 'Attachment');
  }
}

@Injectable()
export class CreateAttachmentAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs<AttachmentArgs>();
    assert(args.activityId, '', ForbiddenException);

    const attachment = await this.prismaService.attachment.findUnique({
      where: { id: args.activityId },
    });
    assert(attachment, '', NotFoundException);

    return ability.can(AbilityAction.Update, subject('Attachment', attachment));
  }
}

@Injectable()
export class UpdateAttachmentAbilityHandler implements IAbilityHandler {
  async handle(ability: AppAbility) {
    return ability.can(AbilityAction.Update, 'Attachment');
  }
}

@Injectable()
export class DeleteAttachmentAbilityHandler implements IAbilityHandler {
  async handle(ability: AppAbility) {
    return ability.can(AbilityAction.Delete, 'Attachment');
  }
}
