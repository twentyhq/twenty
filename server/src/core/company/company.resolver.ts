import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { Prisma, Workspace } from '@prisma/client';
import { accessibleBy } from '@casl/prisma';

import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { AuthWorkspace } from 'src/decorators/auth-workspace.decorator';
import { Company } from 'src/core/@generated/company/company.model';
import { FindManyCompanyArgs } from 'src/core/@generated/company/find-many-company.args';
import { UpdateOneCompanyArgs } from 'src/core/@generated/company/update-one-company.args';
import { CreateOneCompanyArgs } from 'src/core/@generated/company/create-one-company.args';
import { AffectedRows } from 'src/core/@generated/prisma/affected-rows.output';
import { DeleteManyCompanyArgs } from 'src/core/@generated/company/delete-many-company.args';
import {
  PrismaSelect,
  PrismaSelector,
} from 'src/decorators/prisma-select.decorator';
import { AbilityGuard } from 'src/guards/ability.guard';
import { CheckAbilities } from 'src/decorators/check-abilities.decorator';
import {
  CreateCompanyAbilityHandler,
  DeleteCompanyAbilityHandler,
  ReadCompanyAbilityHandler,
  UpdateCompanyAbilityHandler,
} from 'src/ability/handlers/company.ability-handler';
import { UserAbility } from 'src/decorators/user-ability.decorator';
import { AppAbility } from 'src/ability/ability.factory';

import { CompanyService } from './company.service';

@UseGuards(JwtAuthGuard)
@Resolver(() => Company)
export class CompanyResolver {
  constructor(private readonly companyService: CompanyService) {}

  @Query(() => [Company])
  @UseGuards(AbilityGuard)
  @CheckAbilities(ReadCompanyAbilityHandler)
  async findManyCompany(
    @Args() args: FindManyCompanyArgs,
    @UserAbility() ability: AppAbility,
    @PrismaSelector({ modelName: 'Company' })
    prismaSelect: PrismaSelect<'Company'>,
  ): Promise<Partial<Company>[]> {
    return this.companyService.findMany({
      where: args.where
        ? {
            AND: [args.where, accessibleBy(ability).Company],
          }
        : accessibleBy(ability).Company,
      orderBy: args.orderBy,
      cursor: args.cursor,
      take: args.take,
      skip: args.skip,
      distinct: args.distinct,
      select: prismaSelect.value,
    });
  }

  @Query(() => Company)
  @UseGuards(AbilityGuard)
  @CheckAbilities(ReadCompanyAbilityHandler)
  async findUniqueCompany(
    @Args('id') id: string,
    @UserAbility() ability: AppAbility,
    @PrismaSelector({ modelName: 'Company' })
    prismaSelect: PrismaSelect<'Company'>,
  ): Promise<Partial<Company>> {
    return this.companyService.findUniqueOrThrow({
      where: {
        id: id,
      },
      select: prismaSelect.value,
    });
  }

  @Mutation(() => Company, {
    nullable: true,
  })
  @UseGuards(AbilityGuard)
  @CheckAbilities(UpdateCompanyAbilityHandler)
  async updateOneCompany(
    @Args() args: UpdateOneCompanyArgs,
    @PrismaSelector({ modelName: 'Company' })
    prismaSelect: PrismaSelect<'Company'>,
  ): Promise<Partial<Company> | null> {
    return this.companyService.update({
      where: args.where,
      data: args.data,
      select: prismaSelect.value,
    } as Prisma.CompanyUpdateArgs);
  }

  @Mutation(() => AffectedRows, {
    nullable: false,
  })
  @UseGuards(AbilityGuard)
  @CheckAbilities(DeleteCompanyAbilityHandler)
  async deleteManyCompany(
    @Args() args: DeleteManyCompanyArgs,
  ): Promise<AffectedRows> {
    return this.companyService.deleteMany({
      where: args.where,
    });
  }

  @Mutation(() => Company, {
    nullable: false,
  })
  @UseGuards(AbilityGuard)
  @CheckAbilities(CreateCompanyAbilityHandler)
  async createOneCompany(
    @Args() args: CreateOneCompanyArgs,
    @AuthWorkspace() workspace: Workspace,
    @PrismaSelector({ modelName: 'Company' })
    prismaSelect: PrismaSelect<'Company'>,
  ): Promise<Partial<Company>> {
    return this.companyService.create({
      data: {
        ...args.data,
        ...{ workspace: { connect: { id: workspace.id } } },
      },
      select: prismaSelect.value,
    } as Prisma.CompanyCreateArgs);
  }
}
