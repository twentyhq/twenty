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
import { PersonWhereInput } from 'src/core/@generated/person/person-where.input';
import { assert } from 'src/utils/assert';

class PersonArgs {
  where?: PersonWhereInput;
}

@Injectable()
export class ManagePersonAbilityHandler implements IAbilityHandler {
  async handle(ability: AppAbility) {
    return ability.can(AbilityAction.Manage, 'Person');
  }
}

@Injectable()
export class ReadPersonAbilityHandler implements IAbilityHandler {
  handle(ability: AppAbility) {
    return ability.can(AbilityAction.Read, 'Person');
  }
}

@Injectable()
export class CreatePersonAbilityHandler implements IAbilityHandler {
  handle(ability: AppAbility) {
    return ability.can(AbilityAction.Create, 'Person');
  }
}

@Injectable()
export class UpdatePersonAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs<PersonArgs>();
    const person = await this.prismaService.person.findFirst({
      where: args.where,
    });
    assert(person, '', NotFoundException);

    return ability.can(AbilityAction.Update, subject('Person', person));
  }
}

@Injectable()
export class DeletePersonAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs<PersonArgs>();
    const person = await this.prismaService.person.findFirst({
      where: args.where,
    });
    assert(person, '', NotFoundException);

    return ability.can(AbilityAction.Delete, subject('Person', person));
  }
}
