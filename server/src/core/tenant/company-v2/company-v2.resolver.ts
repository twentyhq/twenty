import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { AuthWorkspace } from 'src/decorators/auth-workspace.decorator';
import { Company } from 'src/core/@generated/company/company.model';
import { Workspace } from 'src/core/@generated/workspace/workspace.model';
import { CreateOneCompanyArgs } from 'src/core/@generated/company/create-one-company.args';

import { CompanyV2Service } from './company-v2.service';

@UseGuards(JwtAuthGuard)
@Resolver(() => Company)
export class CompanyV2Resolver {
  constructor(private readonly companyService: CompanyV2Service) {}

  @Query(() => [Company])
  async findManyCompanyFromWorkspaceV2(@AuthWorkspace() workspace: Workspace) {
    return this.companyService.findManyCompanyByWorkspaceId(workspace.id);
  }

  @Mutation(() => Company, {
    nullable: false,
  })
  async createOneCompanyFromWorkspaceV2(
    @AuthWorkspace() workspace: Workspace,
    @Args() args: CreateOneCompanyArgs,
  ): Promise<any> {
    this.companyService.createOneCompanyForWorkspaceId(
      workspace.id,
      args.data.name,
    );

    return {
      id: '123',
    };
  }
}
