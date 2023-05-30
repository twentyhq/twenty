import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { UseGuards } from '@nestjs/common';
import { AuthWorkspace } from './decorators/auth-user.decorator';
import { PrismaService } from 'src/database/prisma.service';
import { Company } from '../@generated/company/company.model';
import { FindManyCompanyArgs } from '../@generated/company/find-many-company.args';
import { DeleteOneCompanyArgs } from '../@generated/company/delete-one-company.args';
import { UpdateOneCompanyArgs } from '../@generated/company/update-one-company.args';
import { CreateOneCompanyArgs } from '../@generated/company/create-one-company.args';
import { AffectedRows } from '../@generated/prisma/affected-rows.output';
import { DeleteManyCompanyArgs } from '../@generated/company/delete-many-company.args';
import { Workspace } from '@prisma/client';

@Resolver(() => Company)
export class CompanyResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @UseGuards(JwtAuthGuard)
  @Query(() => [Company])
  async companies(@Args() args: FindManyCompanyArgs) {
    return this.prismaService.company.findMany(args);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Company, {
    nullable: true,
  })
  async deleteOneCompany(
    @Args() args: DeleteOneCompanyArgs,
  ): Promise<Company | null> {
    return this.prismaService.company.delete(args);
  }

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
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
}
