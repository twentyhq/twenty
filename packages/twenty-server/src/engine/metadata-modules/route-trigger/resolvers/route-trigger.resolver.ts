import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CreateRouteTriggerInput } from 'src/engine/metadata-modules/route-trigger/dtos/create-route-trigger.input';
import { RouteTriggerIdInput } from 'src/engine/metadata-modules/route-trigger/dtos/route-trigger-id.input';
import { RouteTriggerDTO } from 'src/engine/metadata-modules/route-trigger/dtos/route-trigger.dto';
import { UpdateRouteTriggerInput } from 'src/engine/metadata-modules/route-trigger/dtos/update-route-trigger.input';
import { RouteTrigger } from 'src/engine/metadata-modules/route-trigger/route-trigger.entity';
import { RouteTriggerV2Service } from 'src/engine/metadata-modules/route-trigger/services/route-trigger-v2.service';
import { routeTriggerGraphQLApiExceptionHandler } from 'src/engine/metadata-modules/route-trigger/utils/route-trigger-graphql-api-exception-handler.utils';

@UseGuards(WorkspaceAuthGuard)
@Resolver()
@UsePipes(ResolverValidationPipe)
@UseFilters(PreventNestToAutoLogGraphqlErrorsFilter)
export class RouteTriggerResolver {
  constructor(
    private readonly routeV2Service: RouteTriggerV2Service,
    @InjectRepository(RouteTrigger)
    private readonly routeTriggerRepository: Repository<RouteTrigger>,
  ) {}

  @Query(() => RouteTriggerDTO)
  async findOneRouteTrigger(
    @Args('input') { id }: RouteTriggerIdInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    try {
      return await this.routeTriggerRepository.findOneOrFail({
        where: {
          id,
          workspaceId,
        },
      });
    } catch (error) {
      routeTriggerGraphQLApiExceptionHandler(error);
    }
  }

  @Query(() => [RouteTriggerDTO])
  async findManyRouteTriggers(@AuthWorkspace() { id: workspaceId }: Workspace) {
    try {
      return await this.routeTriggerRepository.find({
        where: { workspaceId },
      });
    } catch (error) {
      routeTriggerGraphQLApiExceptionHandler(error);
    }
  }

  @Mutation(() => RouteTriggerDTO)
  async deleteOneRouteTrigger(
    @Args('input') input: RouteTriggerIdInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    try {
      return await this.routeV2Service.destroyOne({
        destroyRouteTriggerInput: input,
        workspaceId,
      });
    } catch (error) {
      routeTriggerGraphQLApiExceptionHandler(error);
    }
  }

  @Mutation(() => RouteTriggerDTO)
  async updateOneRouteTrigger(
    @Args('input')
    input: UpdateRouteTriggerInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    try {
      return await this.routeV2Service.updateOne(input, workspaceId);
    } catch (error) {
      routeTriggerGraphQLApiExceptionHandler(error);
    }
  }

  @Mutation(() => RouteTriggerDTO)
  async createOneRouteTrigger(
    @Args('input')
    input: CreateRouteTriggerInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    try {
      return await this.routeV2Service.createOne(input, workspaceId);
    } catch (error) {
      routeTriggerGraphQLApiExceptionHandler(error);
    }
  }
}
