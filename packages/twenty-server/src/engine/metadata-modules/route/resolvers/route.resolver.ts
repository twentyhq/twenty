import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CreateRouteInput } from 'src/engine/metadata-modules/route/dtos/create-route.input';
import { RouteIdInput } from 'src/engine/metadata-modules/route/dtos/route-id.input';
import { RouteDTO } from 'src/engine/metadata-modules/route/dtos/route.dto';
import { UpdateRouteInput } from 'src/engine/metadata-modules/route/dtos/update-route.input';
import { Route } from 'src/engine/metadata-modules/route/route.entity';
import { RouteV2Service } from 'src/engine/metadata-modules/route/services/route-v2.service';
import { routeGraphQLApiExceptionHandler } from 'src/engine/metadata-modules/route/utils/route-graphql-api-exception-handler.utils';

@UseGuards(WorkspaceAuthGuard)
@Resolver()
@UsePipes(ResolverValidationPipe)
@UseFilters(PreventNestToAutoLogGraphqlErrorsFilter)
export class RouteResolver {
  constructor(
    private readonly routeV2Service: RouteV2Service,
    @InjectRepository(Route)
    private readonly routeRepository: Repository<Route>,
  ) {}

  @Query(() => RouteDTO)
  async findOneRoute(
    @Args('input') { id }: RouteIdInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    try {
      return await this.routeRepository.findOneOrFail({
        where: {
          id,
          workspaceId,
        },
      });
    } catch (error) {
      routeGraphQLApiExceptionHandler(error);
    }
  }

  @Query(() => [RouteDTO])
  async findManyRoutes(@AuthWorkspace() { id: workspaceId }: Workspace) {
    try {
      return await this.routeRepository.find({
        where: { workspaceId },
      });
    } catch (error) {
      routeGraphQLApiExceptionHandler(error);
    }
  }

  @Mutation(() => RouteDTO)
  async deleteOneRoute(
    @Args('input') input: RouteIdInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    try {
      return await this.routeV2Service.destroyOne({
        destroyRouteInput: input,
        workspaceId,
      });
    } catch (error) {
      routeGraphQLApiExceptionHandler(error);
    }
  }

  @Mutation(() => RouteDTO)
  async updateOneRoute(
    @Args('input')
    input: UpdateRouteInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    try {
      return await this.routeV2Service.updateOne(input, workspaceId);
    } catch (error) {
      routeGraphQLApiExceptionHandler(error);
    }
  }

  @Mutation(() => RouteDTO)
  async createOneRoute(
    @Args('input')
    input: CreateRouteInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    try {
      return await this.routeV2Service.createOne(input, workspaceId);
    } catch (error) {
      routeGraphQLApiExceptionHandler(error);
    }
  }
}
