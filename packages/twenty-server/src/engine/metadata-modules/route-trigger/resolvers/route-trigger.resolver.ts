import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { CreateRouteTriggerInput } from 'src/engine/metadata-modules/route-trigger/dtos/create-route-trigger.input';
import { RouteTriggerIdInput } from 'src/engine/metadata-modules/route-trigger/dtos/route-trigger-id.input';
import { RouteTriggerDTO } from 'src/engine/metadata-modules/route-trigger/dtos/route-trigger.dto';
import { UpdateRouteTriggerInput } from 'src/engine/metadata-modules/route-trigger/dtos/update-route-trigger.input';
import {
  RouteTriggerException,
  RouteTriggerExceptionCode,
} from 'src/engine/metadata-modules/route-trigger/exceptions/route-trigger.exception';
import { RouteTriggerV2Service } from 'src/engine/metadata-modules/route-trigger/services/route-trigger-v2.service';
import { fromFlatRouteTriggerToRouteTriggerDto } from 'src/engine/metadata-modules/route-trigger/utils/from-flat-route-trigger-to-route-trigger-dto.util';
import { routeTriggerGraphQLApiExceptionHandler } from 'src/engine/metadata-modules/route-trigger/utils/route-trigger-graphql-api-exception-handler.utils';

@UseGuards(
  WorkspaceAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.WORKFLOWS),
)
@Resolver()
@UsePipes(ResolverValidationPipe)
@UseFilters(
  PreventNestToAutoLogGraphqlErrorsFilter,
  PermissionsGraphqlApiExceptionFilter,
)
export class RouteTriggerResolver {
  constructor(
    private readonly routeV2Service: RouteTriggerV2Service,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  @Query(() => RouteTriggerDTO)
  async findOneRouteTrigger(
    @Args('input') { id }: RouteTriggerIdInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<RouteTriggerDTO> {
    try {
      const { flatRouteTriggerMaps } =
        await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
          {
            workspaceId,
            flatMapsKeys: ['flatRouteTriggerMaps'],
          },
        );

      const flatRouteTrigger = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: id,
        flatEntityMaps: flatRouteTriggerMaps,
      });

      if (!isDefined(flatRouteTrigger)) {
        throw new RouteTriggerException(
          `Route trigger with id ${id} not found`,
          RouteTriggerExceptionCode.ROUTE_NOT_FOUND,
        );
      }

      return fromFlatRouteTriggerToRouteTriggerDto(flatRouteTrigger);
    } catch (error) {
      return routeTriggerGraphQLApiExceptionHandler(error);
    }
  }

  @Query(() => [RouteTriggerDTO])
  async findManyRouteTriggers(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<RouteTriggerDTO[]> {
    try {
      const { flatRouteTriggerMaps } =
        await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
          {
            workspaceId,
            flatMapsKeys: ['flatRouteTriggerMaps'],
          },
        );

      return Object.values(flatRouteTriggerMaps.byId)
        .filter(isDefined)
        .map(fromFlatRouteTriggerToRouteTriggerDto);
    } catch (error) {
      return routeTriggerGraphQLApiExceptionHandler(error);
    }
  }

  @Mutation(() => RouteTriggerDTO)
  async deleteOneRouteTrigger(
    @Args('input') input: RouteTriggerIdInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<RouteTriggerDTO> {
    try {
      const flatRouteTrigger = await this.routeV2Service.destroyOne({
        destroyRouteTriggerInput: input,
        workspaceId,
      });

      return fromFlatRouteTriggerToRouteTriggerDto(flatRouteTrigger);
    } catch (error) {
      return routeTriggerGraphQLApiExceptionHandler(error);
    }
  }

  @Mutation(() => RouteTriggerDTO)
  async updateOneRouteTrigger(
    @Args('input')
    input: UpdateRouteTriggerInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<RouteTriggerDTO> {
    try {
      const flatRouteTrigger = await this.routeV2Service.updateOne(
        input,
        workspaceId,
      );

      return fromFlatRouteTriggerToRouteTriggerDto(flatRouteTrigger);
    } catch (error) {
      return routeTriggerGraphQLApiExceptionHandler(error);
    }
  }

  @Mutation(() => RouteTriggerDTO)
  async createOneRouteTrigger(
    @Args('input')
    input: CreateRouteTriggerInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<RouteTriggerDTO> {
    try {
      const flatRouteTrigger = await this.routeV2Service.createOne(
        input,
        workspaceId,
      );

      return fromFlatRouteTriggerToRouteTriggerDto(flatRouteTrigger);
    } catch (error) {
      return routeTriggerGraphQLApiExceptionHandler(error);
    }
  }
}
