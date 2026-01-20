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
import { CreateCronTriggerInput } from 'src/engine/metadata-modules/cron-trigger/dtos/create-cron-trigger.input';
import { CronTriggerIdInput } from 'src/engine/metadata-modules/cron-trigger/dtos/cron-trigger-id.input';
import { CronTriggerDTO } from 'src/engine/metadata-modules/cron-trigger/dtos/cron-trigger.dto';
import { UpdateCronTriggerInput } from 'src/engine/metadata-modules/cron-trigger/dtos/update-cron-trigger.input';
import {
  CronTriggerException,
  CronTriggerExceptionCode,
} from 'src/engine/metadata-modules/cron-trigger/exceptions/cron-trigger.exception';
import { CronTriggerV2Service } from 'src/engine/metadata-modules/cron-trigger/services/cron-trigger-v2.service';
import { cronTriggerGraphQLApiExceptionHandler } from 'src/engine/metadata-modules/cron-trigger/utils/cron-trigger-graphql-api-exception-handler.util';
import { fromFlatCronTriggerToCronTriggerDto } from 'src/engine/metadata-modules/cron-trigger/utils/from-flat-cron-trigger-to-cron-trigger-dto.util';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';

@UseGuards(
  WorkspaceAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.WORKFLOWS),
)
@Resolver()
@UsePipes(ResolverValidationPipe)
@UseFilters(PreventNestToAutoLogGraphqlErrorsFilter)
export class CronTriggerResolver {
  constructor(
    private readonly cronTriggerV2Service: CronTriggerV2Service,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  @Query(() => CronTriggerDTO)
  async findOneCronTrigger(
    @Args('input') { id }: CronTriggerIdInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<CronTriggerDTO> {
    try {
      const { flatCronTriggerMaps } =
        await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
          {
            workspaceId,
            flatMapsKeys: ['flatCronTriggerMaps'],
          },
        );

      const flatCronTrigger = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: id,
        flatEntityMaps: flatCronTriggerMaps,
      });

      if (!isDefined(flatCronTrigger)) {
        throw new CronTriggerException(
          `Cron trigger with id ${id} not found`,
          CronTriggerExceptionCode.CRON_TRIGGER_NOT_FOUND,
        );
      }

      return fromFlatCronTriggerToCronTriggerDto(flatCronTrigger);
    } catch (error) {
      return cronTriggerGraphQLApiExceptionHandler(error);
    }
  }

  @Query(() => [CronTriggerDTO])
  async findManyCronTriggers(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<CronTriggerDTO[]> {
    try {
      const { flatCronTriggerMaps } =
        await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
          {
            workspaceId,
            flatMapsKeys: ['flatCronTriggerMaps'],
          },
        );

      return Object.values(flatCronTriggerMaps.byId)
        .filter(isDefined)
        .map(fromFlatCronTriggerToCronTriggerDto);
    } catch (error) {
      return cronTriggerGraphQLApiExceptionHandler(error);
    }
  }

  @Mutation(() => CronTriggerDTO)
  async deleteOneCronTrigger(
    @Args('input') input: CronTriggerIdInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<CronTriggerDTO> {
    try {
      const flatCronTrigger = await this.cronTriggerV2Service.destroyOne({
        destroyCronTriggerInput: input,
        workspaceId,
      });

      return fromFlatCronTriggerToCronTriggerDto(flatCronTrigger);
    } catch (error) {
      return cronTriggerGraphQLApiExceptionHandler(error);
    }
  }

  @Mutation(() => CronTriggerDTO)
  async updateOneCronTrigger(
    @Args('input')
    input: UpdateCronTriggerInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<CronTriggerDTO> {
    try {
      const flatCronTrigger = await this.cronTriggerV2Service.updateOne(
        input,
        workspaceId,
      );

      return fromFlatCronTriggerToCronTriggerDto(flatCronTrigger);
    } catch (error) {
      return cronTriggerGraphQLApiExceptionHandler(error);
    }
  }

  @Mutation(() => CronTriggerDTO)
  async createOneCronTrigger(
    @Args('input')
    input: CreateCronTriggerInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ): Promise<CronTriggerDTO> {
    try {
      const flatCronTrigger = await this.cronTriggerV2Service.createOne(
        input,
        workspaceId,
      );

      return fromFlatCronTriggerToCronTriggerDto(flatCronTrigger);
    } catch (error) {
      return cronTriggerGraphQLApiExceptionHandler(error);
    }
  }
}
