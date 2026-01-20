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
import { CreateDatabaseEventTriggerInput } from 'src/engine/metadata-modules/database-event-trigger/dtos/create-database-event-trigger.input';
import { DatabaseEventTriggerIdInput } from 'src/engine/metadata-modules/database-event-trigger/dtos/database-event-trigger-id.input';
import { DatabaseEventTriggerDTO } from 'src/engine/metadata-modules/database-event-trigger/dtos/database-event-trigger.dto';
import { UpdateDatabaseEventTriggerInput } from 'src/engine/metadata-modules/database-event-trigger/dtos/update-database-event-trigger.input';
import {
  DatabaseEventTriggerException,
  DatabaseEventTriggerExceptionCode,
} from 'src/engine/metadata-modules/database-event-trigger/exceptions/database-event-trigger.exception';
import { DatabaseEventTriggerV2Service } from 'src/engine/metadata-modules/database-event-trigger/services/database-event-trigger-v2.service';
import { databaseEventTriggerGraphQLApiExceptionHandler } from 'src/engine/metadata-modules/database-event-trigger/utils/database-event-trigger-graphql-api-exception-handler.utils';
import { fromFlatDatabaseEventTriggerToDatabaseEventTriggerDto } from 'src/engine/metadata-modules/database-event-trigger/utils/from-flat-database-event-trigger-to-database-event-trigger-dto.util';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';

@UseGuards(
  WorkspaceAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.WORKFLOWS),
)
@Resolver()
@UsePipes(ResolverValidationPipe)
@UseFilters(PreventNestToAutoLogGraphqlErrorsFilter)
export class DatabaseEventTriggerResolver {
  constructor(
    private readonly databaseEventTriggerV2Service: DatabaseEventTriggerV2Service,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  @Query(() => DatabaseEventTriggerDTO)
  async findOneDatabaseEventTrigger(
    @Args('input') { id }: DatabaseEventTriggerIdInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<DatabaseEventTriggerDTO> {
    try {
      const { flatDatabaseEventTriggerMaps } =
        await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
          {
            workspaceId,
            flatMapsKeys: ['flatDatabaseEventTriggerMaps'],
          },
        );

      const flatDatabaseEventTrigger = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: id,
        flatEntityMaps: flatDatabaseEventTriggerMaps,
      });

      if (!isDefined(flatDatabaseEventTrigger)) {
        throw new DatabaseEventTriggerException(
          `Database event trigger with id ${id} not found`,
          DatabaseEventTriggerExceptionCode.DATABASE_EVENT_TRIGGER_NOT_FOUND,
        );
      }

      return fromFlatDatabaseEventTriggerToDatabaseEventTriggerDto(
        flatDatabaseEventTrigger,
      );
    } catch (error) {
      return databaseEventTriggerGraphQLApiExceptionHandler(error);
    }
  }

  @Query(() => [DatabaseEventTriggerDTO])
  async findManyDatabaseEventTriggers(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<DatabaseEventTriggerDTO[]> {
    try {
      const { flatDatabaseEventTriggerMaps } =
        await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
          {
            workspaceId,
            flatMapsKeys: ['flatDatabaseEventTriggerMaps'],
          },
        );

      return Object.values(flatDatabaseEventTriggerMaps.byId)
        .filter(isDefined)
        .map(fromFlatDatabaseEventTriggerToDatabaseEventTriggerDto);
    } catch (error) {
      return databaseEventTriggerGraphQLApiExceptionHandler(error);
    }
  }

  @Mutation(() => DatabaseEventTriggerDTO)
  async deleteOneDatabaseEventTrigger(
    @Args('input') input: DatabaseEventTriggerIdInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<DatabaseEventTriggerDTO> {
    try {
      const flatDatabaseEventTrigger =
        await this.databaseEventTriggerV2Service.destroyOne({
          destroyDatabaseEventTriggerInput: input,
          workspaceId,
        });

      return fromFlatDatabaseEventTriggerToDatabaseEventTriggerDto(
        flatDatabaseEventTrigger,
      );
    } catch (error) {
      return databaseEventTriggerGraphQLApiExceptionHandler(error);
    }
  }

  @Mutation(() => DatabaseEventTriggerDTO)
  async updateOneDatabaseEventTrigger(
    @Args('input')
    input: UpdateDatabaseEventTriggerInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<DatabaseEventTriggerDTO> {
    try {
      const flatDatabaseEventTrigger =
        await this.databaseEventTriggerV2Service.updateOne(input, workspaceId);

      return fromFlatDatabaseEventTriggerToDatabaseEventTriggerDto(
        flatDatabaseEventTrigger,
      );
    } catch (error) {
      return databaseEventTriggerGraphQLApiExceptionHandler(error);
    }
  }

  @Mutation(() => DatabaseEventTriggerDTO)
  async createOneDatabaseEventTrigger(
    @Args('input')
    input: CreateDatabaseEventTriggerInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<DatabaseEventTriggerDTO> {
    try {
      const flatDatabaseEventTrigger =
        await this.databaseEventTriggerV2Service.createOne(input, workspaceId);

      return fromFlatDatabaseEventTriggerToDatabaseEventTriggerDto(
        flatDatabaseEventTrigger,
      );
    } catch (error) {
      return databaseEventTriggerGraphQLApiExceptionHandler(error);
    }
  }
}
