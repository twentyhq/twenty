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
import { PipelineProgressWhereInput } from 'src/core/@generated/pipeline-progress/pipeline-progress-where.input';
import { relationAbilityChecker } from 'src/ability/ability.util';
import { assert } from 'src/utils/assert';

class PipelineProgressArgs {
  where?: PipelineProgressWhereInput;
  [key: string]: any;
}

@Injectable()
export class ManagePipelineProgressAbilityHandler implements IAbilityHandler {
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
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs();

    const allowed = await relationAbilityChecker(
      'PipelineProgress',
      ability,
      this.prismaService.client,
      args,
    );

    if (!allowed) {
      return false;
    }

    return ability.can(AbilityAction.Create, 'PipelineProgress');
  }
}

@Injectable()
export class UpdatePipelineProgressAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs<PipelineProgressArgs>();
    const pipelineProgress =
      await this.prismaService.client.pipelineProgress.findFirst({
        where: args.where,
      });
    assert(pipelineProgress, '', NotFoundException);

    const allowed = await relationAbilityChecker(
      'PipelineProgress',
      ability,
      this.prismaService.client,
      args,
    );

    if (!allowed) {
      return false;
    }

    return ability.can(
      AbilityAction.Update,
      subject('PipelineProgress', pipelineProgress),
    );
  }
}

@Injectable()
export class DeletePipelineProgressAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs<PipelineProgressArgs>();
    const pipelineProgress =
      await this.prismaService.client.pipelineProgress.findFirst({
        where: args.where,
      });
    assert(pipelineProgress, '', NotFoundException);

    return ability.can(
      AbilityAction.Delete,
      subject('PipelineProgress', pipelineProgress),
    );
  }
}
