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
import { ViewSortWhereUniqueInput } from 'src/core/@generated/view-sort/view-sort-where-unique.input';
import { ViewSortWhereInput } from 'src/core/@generated/view-sort/view-sort-where.input';

class ViewSortArgs {
  where?: ViewSortWhereInput | ViewSortWhereUniqueInput;
  [key: string]: any;
}

const isViewSortWhereUniqueInput = (
  input: ViewSortWhereInput | ViewSortWhereUniqueInput,
): input is ViewSortWhereUniqueInput => 'viewId_key' in input;

@Injectable()
export class ReadViewSortAbilityHandler implements IAbilityHandler {
  handle(ability: AppAbility) {
    return ability.can(AbilityAction.Read, 'ViewSort');
  }
}

@Injectable()
export class CreateViewSortAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs();

    const allowed = await relationAbilityChecker(
      'ViewSort',
      ability,
      this.prismaService.client,
      args,
    );

    if (!allowed) {
      return false;
    }

    return ability.can(AbilityAction.Create, 'ViewSort');
  }
}

@Injectable()
export class UpdateViewSortAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs<ViewSortArgs>();
    const viewSort = await this.prismaService.client.viewSort.findFirst({
      where:
        args.where && isViewSortWhereUniqueInput(args.where)
          ? args.where.viewId_key
          : args.where,
    });
    assert(viewSort, '', NotFoundException);

    const allowed = await relationAbilityChecker(
      'ViewSort',
      ability,
      this.prismaService.client,
      args,
    );

    if (!allowed) {
      return false;
    }

    return ability.can(AbilityAction.Update, subject('ViewSort', viewSort));
  }
}

@Injectable()
export class DeleteViewSortAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs<ViewSortArgs>();
    const where = convertToWhereInput(
      args.where && isViewSortWhereUniqueInput(args.where)
        ? args.where.viewId_key
        : args.where,
    );
    const viewSorts = await this.prismaService.client.viewSort.findMany({
      where,
    });
    assert(viewSorts.length, '', NotFoundException);

    for (const viewSort of viewSorts) {
      const allowed = ability.can(
        AbilityAction.Delete,
        subject('ViewSort', viewSort),
      );

      if (!allowed) {
        return false;
      }
    }

    return true;
  }
}
