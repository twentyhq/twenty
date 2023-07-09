import { PrismaService } from 'src/database/prisma.service';
import { AbilityAction } from '../ability.action';
import { AppAbility } from '../ability.factory';
import { IAbilityHandler } from '../interfaces/ability-handler.interface';
import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { subject } from '@casl/ability';
import { WorkspaceWhereInput } from 'src/core/@generated/workspace/workspace-where.input';
import { GqlExecutionContext } from '@nestjs/graphql';
import { assert } from 'src/utils/assert';
import { getRequest } from 'src/utils/extract-request';

class WorksapceArgs {
  where?: WorkspaceWhereInput;
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
  handle(ability: AppAbility) {
    return ability.can(AbilityAction.Create, 'Workspace');
  }
}

@Injectable()
export class UpdateWorkspaceAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const request = getRequest(context);
    assert(request.user.workspace.id, '', ForbiddenException);

    const workspace = await this.prismaService.workspace.findUnique({
      where: { id: request.user.workspace.id },
    });
    assert(workspace, '', NotFoundException);

    return ability.can(AbilityAction.Update, subject('Workspace', workspace));
  }
}

@Injectable()
export class DeleteWorkspaceAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs<WorksapceArgs>();
    const workspace = await this.prismaService.workspace.findFirst({
      where: args.where,
    });
    assert(workspace, '', NotFoundException);

    return ability.can(AbilityAction.Delete, subject('Workspace', workspace));
  }
}
