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
import { CompanyWhereUniqueInput } from 'src/core/@generated/company/company-where-unique.input';
import {
  convertToWhereInput,
  relationAbilityChecker,
} from 'src/ability/ability.util';
import { assert } from 'src/utils/assert';

class CompanyArgs {
  where?: CompanyWhereUniqueInput | CompanyWhereInput;
  [key: string]: any;
}

@Injectable()
export class ManageCompanyAbilityHandler implements IAbilityHandler {
  async handle(ability: AppAbility) {
    return ability.can(AbilityAction.Manage, 'Company');
  }
}

@Injectable()
export class ReadOneCompanyAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs<CompanyArgs>();
    const company = await this.prismaService.client.company.findFirst({
      where: args.where,
    });
    assert(company, '', NotFoundException);

    return ability.can(AbilityAction.Read, subject('Company', company));
  }
}

@Injectable()
export class CreateCompanyAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs();

    const allowed = await relationAbilityChecker(
      'Company',
      ability,
      this.prismaService.client,
      args,
    );

    if (!allowed) {
      return false;
    }

    return ability.can(AbilityAction.Create, 'Company');
  }
}

@Injectable()
export class UpdateCompanyAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs<CompanyArgs>();
    const where = convertToWhereInput(args.where);
    const companies = await this.prismaService.client.company.findMany({
      where,
    });
    assert(companies.length, '', NotFoundException);

    const allowed = await relationAbilityChecker(
      'Company',
      ability,
      this.prismaService.client,
      args,
    );

    if (!allowed) {
      return false;
    }

    for (const company of companies) {
      const allowed = ability.can(
        AbilityAction.Delete,
        subject('Company', company),
      );

      if (!allowed) {
        return false;
      }
    }

    return true;
  }
}

@Injectable()
export class DeleteCompanyAbilityHandler implements IAbilityHandler {
  constructor(private readonly prismaService: PrismaService) {}

  async handle(ability: AppAbility, context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs<CompanyArgs>();
    const where = convertToWhereInput(args.where);
    const companies = await this.prismaService.client.company.findMany({
      where,
    });
    assert(companies.length, '', NotFoundException);

    for (const company of companies) {
      const allowed = ability.can(
        AbilityAction.Delete,
        subject('Company', company),
      );

      if (!allowed) {
        return false;
      }
    }

    return true;
  }
}
