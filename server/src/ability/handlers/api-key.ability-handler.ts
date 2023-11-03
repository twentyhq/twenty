import {
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { subject } from '@casl/ability';

import { IAbilityHandler } from 'src/ability/interfaces/ability-handler.interface';

import { AppAbility } from 'src/ability/ability.factory';
import { AbilityAction } from 'src/ability/ability.action';
import { PrismaService } from 'src/database/prisma.service';
import { ApiKeyWhereUniqueInput } from 'src/core/@generated/api-key/api-key-where-unique.input';
import { ApiKeyWhereInput } from 'src/core/@generated/api-key/api-key-where.input';
import { assert } from 'src/utils/assert';
import {
  convertToWhereInput,
  relationAbilityChecker,
} from 'src/ability/ability.util';

class ApiKeyArgs {
  where?: ApiKeyWhereUniqueInput | ApiKeyWhereInput;
  [key: string]: any;
}

@Injectable()
export class ManageApiKeyAbilityHandler implements IAbilityHandler {
  async handle(ability: AppAbility) {
    return ability.can(AbilityAction.Manage, 'ApiKey');
  }
}

@Injectable()
export class ReadApiKeyAbilityHandler implements IAbilityHandler {
  async handle(ability: AppAbility) {
    return ability.can(AbilityAction.Read, 'ApiKey');
  }
}

@Injectable()
export class CreateApiKeyAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs();
    const allowed = await relationAbilityChecker(
      'ApiKey',
      ability,
      this.prismaService.client,
      args,
    );
    if (!allowed) {
      return false;
    }
    return ability.can(AbilityAction.Create, 'ApiKey');
  }
}

@Injectable()
export class UpdateApiKeyAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs<ApiKeyArgs>();
    const where = convertToWhereInput(args.where);
    const apiKey = await this.prismaService.client.apiKey.findFirst({
      where,
    });
    assert(apiKey, '', NotFoundException);
    const allowed = await relationAbilityChecker(
      'ApiKey',
      ability,
      this.prismaService.client,
      args,
    );
    if (!allowed) {
      return false;
    }
    return ability.can(AbilityAction.Update, subject('ApiKey', apiKey));
  }
}
