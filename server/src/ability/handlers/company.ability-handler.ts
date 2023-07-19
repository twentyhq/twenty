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
import { CompanyWhereInput } from 'src/core/@generated/company/company-where.input';
import { assert } from 'src/utils/assert';

class CompanyArgs {
  where?: CompanyWhereInput;
}

@Injectable()
export class ManageCompanyAbilityHandler implements IAbilityHandler {
  async handle(ability: AppAbility) {
    return ability.can(AbilityAction.Manage, 'Company');
  }
}

@Injectable()
export class ReadCompanyAbilityHandler implements IAbilityHandler {
  handle(ability: AppAbility) {
    return ability.can(AbilityAction.Read, 'Company');
  }
}

@Injectable()
export class CreateCompanyAbilityHandler implements IAbilityHandler {
  handle(ability: AppAbility) {
    return ability.can(AbilityAction.Create, 'Company');
  }
}

@Injectable()
export class UpdateCompanyAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs<CompanyArgs>();
    const company = await this.prismaService.company.findFirst({
      where: args.where,
    });

    assert(company, '', NotFoundException);

    return ability.can(AbilityAction.Update, subject('Company', company));
  }
}

@Injectable()
export class DeleteCompanyAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs<CompanyArgs>();
    const company = await this.prismaService.company.findFirst({
      where: args.where,
    });
    assert(company, '', NotFoundException);

    return ability.can(AbilityAction.Delete, subject('Company', company));
  }
}
