import {
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { subject } from '@casl/ability';

import { IAbilityHandler } from 'src/ability/interfaces/ability-handler.interface';

import { AbilityAction } from 'src/ability/ability.action';
import { AppAbility } from 'src/ability/ability.factory';
import {
  convertToWhereInput,
  relationAbilityChecker,
} from 'src/ability/ability.util';
import { PrismaService } from 'src/database/prisma.service';
import { assert } from 'src/utils/assert';
import { ViewFilterWhereUniqueInput } from 'src/core/@generated/view-filter/view-filter-where-unique.input';
import { ViewFilterWhereInput } from 'src/core/@generated/view-filter/view-filter-where.input';

class ViewFilterArgs {
  where?: ViewFilterWhereInput | ViewFilterWhereUniqueInput;
  [key: string]: any;
}

const isViewFilterWhereUniqueInput = (
  input: ViewFilterWhereInput | ViewFilterWhereUniqueInput,
): input is ViewFilterWhereUniqueInput => 'viewId_key' in input;

@Injectable()
export class ReadViewFilterAbilityHandler implements IAbilityHandler {
  handle(ability: AppAbility) {
    return ability.can(AbilityAction.Read, 'ViewFilter');
  }
}

@Injectable()
export class CreateViewFilterAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs();

    const allowed = await relationAbilityChecker(
      'ViewFilter',
      ability,
      this.prismaService.client,
      args,
    );

    if (!allowed) {
      return false;
    }

    return ability.can(AbilityAction.Create, 'ViewFilter');
  }
}

@Injectable()
export class UpdateViewFilterAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs<ViewFilterArgs>();
    const viewFilter = await this.prismaService.client.viewFilter.findFirst({
      where:
        args.where && isViewFilterWhereUniqueInput(args.where)
          ? args.where.viewId_key
          : args.where,
    });
    assert(viewFilter, '', NotFoundException);

    const allowed = await relationAbilityChecker(
      'ViewFilter',
      ability,
      this.prismaService.client,
      args,
    );

    if (!allowed) {
      return false;
    }

    return ability.can(AbilityAction.Update, subject('ViewFilter', viewFilter));
  }
}

@Injectable()
export class DeleteViewFilterAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs<ViewFilterArgs>();
    const where = convertToWhereInput(
      args.where && isViewFilterWhereUniqueInput(args.where)
        ? args.where.viewId_key
        : args.where,
    );
    const viewFilters = await this.prismaService.client.viewFilter.findMany({
      where,
    });
    assert(viewFilters.length, '', NotFoundException);

    for (const viewFilter of viewFilters) {
      const allowed = ability.can(
        AbilityAction.Delete,
        subject('ViewFilter', viewFilter),
      );

      if (!allowed) {
        return false;
      }
    }

    return true;
  }
}
