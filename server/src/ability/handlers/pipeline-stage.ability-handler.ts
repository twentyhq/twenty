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
import { PipelineStageWhereInput } from 'src/core/@generated/pipeline-stage/pipeline-stage-where.input';
import { relationAbilityChecker } from 'src/ability/ability.util';
import { assert } from 'src/utils/assert';

class PipelineStageArgs {
  where?: PipelineStageWhereInput;
  [key: string]: any;
}

@Injectable()
export class ManagePipelineStageAbilityHandler implements IAbilityHandler {
  async handle(ability: AppAbility) {
    return ability.can(AbilityAction.Manage, 'PipelineStage');
  }
}

@Injectable()
export class ReadPipelineStageAbilityHandler implements IAbilityHandler {
  handle(ability: AppAbility) {
    return ability.can(AbilityAction.Read, 'PipelineStage');
  }
}

@Injectable()
export class CreatePipelineStageAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs();

    const allowed = await relationAbilityChecker(
      'PipelineStage',
      ability,
      this.prismaService.client,
      args,
    );

    if (!allowed) {
      return false;
    }

    return ability.can(AbilityAction.Create, 'PipelineStage');
  }
}

@Injectable()
export class UpdatePipelineStageAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs<PipelineStageArgs>();
    const pipelineStage =
      await this.prismaService.client.pipelineStage.findFirst({
        where: args.where,
      });
    assert(pipelineStage, '', NotFoundException);

    const allowed = await relationAbilityChecker(
      'PipelineStage',
      ability,
      this.prismaService.client,
      args,
    );

    if (!allowed) {
      return false;
    }

    return ability.can(
      AbilityAction.Update,
      subject('PipelineStage', pipelineStage),
    );
  }
}

@Injectable()
export class DeletePipelineStageAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs<PipelineStageArgs>();
    const pipelineStage =
      await this.prismaService.client.pipelineStage.findFirst({
        where: args.where,
      });
    assert(pipelineStage, '', NotFoundException);

    return ability.can(
      AbilityAction.Delete,
      subject('PipelineStage', pipelineStage),
    );
  }
}
