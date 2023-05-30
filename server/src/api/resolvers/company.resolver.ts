import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { UseGuards } from '@nestjs/common';
import { AuthWorkspace } from './decorators/auth-workspace.decorator';
import { PrismaService } from 'src/database/prisma.service';
import { Company } from '../@generated/company/company.model';
import { FindManyCompanyArgs } from '../@generated/company/find-many-company.args';
import { UpdateOneCompanyArgs } from '../@generated/company/update-one-company.args';
import { CreateOneCompanyArgs } from '../@generated/company/create-one-company.args';
import { AffectedRows } from '../@generated/prisma/affected-rows.output';
import { DeleteManyCompanyArgs } from '../@generated/company/delete-many-company.args';
import { Workspace } from '@prisma/client';
import { ArgsService } from './services/args.service';
import { CheckWorkspaceOwnership } from 'src/auth/guards/check-workspace-ownership.guard';

@UseGuards(JwtAuthGuard, CheckWorkspaceOwnership)
@Resolver(() => Company)
export class CompanyResolver {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly argsService: ArgsService,
  ) {}

  @Query(() => [Company])
  async findManyCompany(
    @Args() args: FindManyCompanyArgs,
    @AuthWorkspace() workspace: Workspace,
  ) {
    const preparedArgs =
      await this.argsService.prepareFindManyArgs<FindManyCompanyArgs>(
        args,
        workspace,
      );
    return this.prismaService.company.findMany(preparedArgs);
  }

  @Mutation(() => Company, {
    nullable: true,
  })
  async updateOneCompany(
    @Args() args: UpdateOneCompanyArgs,
  ): Promise<Company | null> {
    if (!args.data.accountOwner?.connect?.id) {
      args.data.accountOwner = { disconnect: true };
    }
    return this.prismaService.company.update({
      ...args,
    });
  }

  @Mutation(() => AffectedRows, {
    nullable: false,
  })
  async deleteManyCompany(
    @Args() args: DeleteManyCompanyArgs,
  ): Promise<AffectedRows> {
    return this.prismaService.company.deleteMany({
      ...args,
    });
  }

  @Mutation(() => Company, {
    nullable: false,
  })
  async createOneCompany(
    @Args() args: CreateOneCompanyArgs,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<Company> {
    return this.prismaService.company.create({
      data: {
        ...args.data,
        ...{ workspace: { connect: { id: workspace.id } } },
      },
    });
  }
}
