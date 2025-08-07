import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Int, Query, Resolver } from '@nestjs/graphql';

import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

import { CustomersService } from './customers.service';
import {
  Customer,
  CustomerConnection,
  CustomerFiltersInput
} from './dto/customer.dto';

@Resolver(() => Customer)
export class CustomersResolver {
  constructor(private readonly customersService: CustomersService) {}

  @Query(() => CustomerConnection, { name: 'customers' })
  @UseGuards(WorkspaceAuthGuard)
  @UsePipes(ResolverValidationPipe)
  @UseFilters(PreventNestToAutoLogGraphqlErrorsFilter)
  async findAll(
    @AuthWorkspace() workspace: Workspace,
    @Args('filters', { type: () => CustomerFiltersInput, nullable: true })
    filters?: CustomerFiltersInput,
    @Args('page', { type: () => Int, nullable: true, defaultValue: 1 })
    page?: number,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 10 })
    limit?: number,
  ): Promise<CustomerConnection> {
    return this.customersService.findAll(
      workspace.id,
      filters,
      { page, limit },
    );
  }

}
