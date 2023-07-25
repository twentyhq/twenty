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
import { WorkspaceWhereInput } from 'src/core/@generated/workspace/workspace-where.input';
import { relationAbilityChecker } from 'src/ability/ability.util';
import { assert } from 'src/utils/assert';

class WorkspaceArgs {
  where?: WorkspaceWhereInput;
  [key: string]: any;
}

@Injectable()
export class ManageWorkspaceAbilityHandler implements IAbilityHandler {
  async handle(ability: AppAbility) {
    return ability.can(AbilityAction.Manage, 'Workspace');
  }
}

@Injectable()
export class ReadWorkspaceAbilityHandler implements IAbilityHandler {
  handle(ability: AppAbility) {
    return ability.can(AbilityAction.Read, 'Workspace');
  }
}

@Injectable()
export class CreateWorkspaceAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs();

    const allowed = await relationAbilityChecker(
      'Workspace',
      ability,
      this.prismaService.client,
      args,
    );

    if (!allowed) {
      return false;
    }

    return ability.can(AbilityAction.Create, 'Workspace');
  }
}

@Injectable()
export class UpdateWorkspaceAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs<WorkspaceArgs>();
    const workspace = await this.prismaService.client.workspace.findFirst({
      where: args.where,
    });
    assert(workspace, '', NotFoundException);

    const allowed = await relationAbilityChecker(
      'Workspace',
      ability,
      this.prismaService.client,
      args,
    );

    if (!allowed) {
      return false;
    }

    return ability.can(AbilityAction.Update, subject('Workspace', workspace));
  }
}

@Injectable()
export class DeleteWorkspaceAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs<WorkspaceArgs>();
    const workspace = await this.prismaService.client.workspace.findFirst({
      where: args.where,
    });
    assert(workspace, '', NotFoundException);

    return ability.can(AbilityAction.Delete, subject('Workspace', workspace));
  }
}
