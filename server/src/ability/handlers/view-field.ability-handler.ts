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
import { relationAbilityChecker } from 'src/ability/ability.util';
import { ViewFieldWhereInput } from 'src/core/@generated/view-field/view-field-where.input';
import { PrismaService } from 'src/database/prisma.service';
import { assert } from 'src/utils/assert';
import { ViewFieldWhereUniqueInput } from 'src/core/@generated/view-field/view-field-where-unique.input';

class ViewFieldArgs {
  where?: ViewFieldWhereInput;
  [key: string]: any;
}

const isViewFieldWhereUniqueInput = (
  input: ViewFieldWhereInput | ViewFieldWhereUniqueInput,
): input is ViewFieldWhereUniqueInput => 'viewId_key' in input;

@Injectable()
export class ReadViewFieldAbilityHandler implements IAbilityHandler {
  handle(ability: AppAbility) {
    return ability.can(AbilityAction.Read, 'ViewField');
  }
}

@Injectable()
export class CreateViewFieldAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs();

    const allowed = await relationAbilityChecker(
      'ViewField',
      ability,
      this.prismaService.client,
      args,
    );

    if (!allowed) {
      return false;
    }

    return ability.can(AbilityAction.Create, 'ViewField');
  }
}

@Injectable()
export class UpdateViewFieldAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs<ViewFieldArgs>();
    const viewField = await this.prismaService.client.viewField.findFirst({
      where:
        args.where && isViewFieldWhereUniqueInput(args.where)
          ? args.where.viewId_key
          : args.where,
    });
    assert(viewField, '', NotFoundException);

    const allowed = await relationAbilityChecker(
      'ViewField',
      ability,
      this.prismaService.client,
      args,
    );

    if (!allowed) {
      return false;
    }

    return ability.can(AbilityAction.Update, subject('ViewField', viewField));
  }
}
