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
import { WorkspaceMemberWhereInput } from 'src/core/@generated/workspace-member/workspace-member-where.input';
import { relationAbilityChecker } from 'src/ability/ability.util';
import { assert } from 'src/utils/assert';

class WorkspaceMemberArgs {
  where?: WorkspaceMemberWhereInput;
  [key: string]: any;
}

@Injectable()
export class ManageWorkspaceMemberAbilityHandler implements IAbilityHandler {
  async handle(ability: AppAbility) {
    return ability.can(AbilityAction.Manage, 'WorkspaceMember');
  }
}

@Injectable()
export class ReadWorkspaceMemberAbilityHandler implements IAbilityHandler {
  handle(ability: AppAbility) {
    return ability.can(AbilityAction.Read, 'WorkspaceMember');
  }
}

@Injectable()
export class CreateWorkspaceMemberAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs();

    const allowed = await relationAbilityChecker(
      'WorkspaceMember',
      ability,
      this.prismaService.client,
      args,
    );

    if (!allowed) {
      return false;
    }

    return ability.can(AbilityAction.Create, 'WorkspaceMember');
  }
}

@Injectable()
export class UpdateWorkspaceMemberAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs<WorkspaceMemberArgs>();
    const workspaceMember =
      await this.prismaService.client.workspaceMember.findFirst({
        where: args.where,
      });
    assert(workspaceMember, '', NotFoundException);

    const allowed = await relationAbilityChecker(
      'WorkspaceMember',
      ability,
      this.prismaService.client,
      args,
    );

    if (!allowed) {
      return false;
    }

    return ability.can(
      AbilityAction.Update,
      subject('WorkspaceMember', workspaceMember),
    );
  }
}

@Injectable()
export class DeleteWorkspaceMemberAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs<WorkspaceMemberArgs>();
    const workspaceMember =
      await this.prismaService.client.workspaceMember.findFirst({
        where: args.where,
      });
    assert(workspaceMember, '', NotFoundException);

    return ability.can(
      AbilityAction.Delete,
      subject('WorkspaceMember', workspaceMember),
    );
  }
}
