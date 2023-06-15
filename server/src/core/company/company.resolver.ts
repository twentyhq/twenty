import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { UseGuards } from '@nestjs/common';
import { AuthWorkspace } from '../../decorators/auth-workspace.decorator';
import { Company } from '../../core/@generated/company/company.model';
import { FindManyCompanyArgs } from '../../core/@generated/company/find-many-company.args';
import { UpdateOneCompanyArgs } from '../../core/@generated/company/update-one-company.args';
import { CreateOneCompanyArgs } from '../../core/@generated/company/create-one-company.args';
import { AffectedRows } from '../../core/@generated/prisma/affected-rows.output';
import { DeleteManyCompanyArgs } from '../../core/@generated/company/delete-many-company.args';
import { Workspace } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { UpdateOneGuard } from '../../guards/update-one.guard';
import { DeleteManyGuard } from '../../guards/delete-many.guard';
import { CreateOneGuard } from '../../guards/create-one.guard';
import { CompanyService } from './company.service';
import { prepareFindManyArgs } from 'src/utils/prepare-find-many';

@UseGuards(JwtAuthGuard)
@Resolver(() => Company)
export class CompanyResolver {
  constructor(private readonly companyService: CompanyService) {}

  @Query(() => [Company])
  async findManyCompany(
    @Args() args: FindManyCompanyArgs,
    @AuthWorkspace() workspace: Workspace,
  ) {
    const preparedArgs = prepareFindManyArgs<FindManyCompanyArgs>(
      args,
      workspace,
    );
    return this.companyService.findMany(preparedArgs);
  }

  @UseGuards(UpdateOneGuard)
  @Mutation(() => Company, {
    nullable: true,
  })
  async updateOneCompany(
    @Args() args: UpdateOneCompanyArgs,
  ): Promise<Company | null> {
    if (!args.data.accountOwner?.connect?.id) {
      args.data.accountOwner = { disconnect: true };
    }

    return this.companyService.update({
      ...args,
    } satisfies UpdateOneCompanyArgs as Prisma.CompanyUpdateArgs);
  }

  @UseGuards(DeleteManyGuard)
  @Mutation(() => AffectedRows, {
    nullable: false,
  })
  async deleteManyCompany(
    @Args() args: DeleteManyCompanyArgs,
  ): Promise<AffectedRows> {
    return this.companyService.deleteMany({
      ...args,
    });
  }

  @UseGuards(CreateOneGuard)
  @Mutation(() => Company, {
    nullable: false,
  })
  async createOneCompany(
    @Args() args: CreateOneCompanyArgs,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<Company> {
    return this.companyService.create({
      data: {
        ...args.data,
        ...{ workspace: { connect: { id: workspace.id } } },
      },
    } satisfies CreateOneCompanyArgs as Prisma.CompanyCreateArgs);
  }
}
