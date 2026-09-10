import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatTimelineActivityType } from 'src/engine/metadata-modules/flat-timeline-activity-type/types/flat-timeline-activity-type.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type TimelineActivityTypeDTO } from 'src/engine/metadata-modules/timeline-activity-type/dtos/timeline-activity-type.dto';
import { type UpdateTimelineActivityTypeInput } from 'src/engine/metadata-modules/timeline-activity-type/dtos/update-timeline-activity-type.input';
import { TimelineActivityTypeExceptionCode } from 'src/engine/metadata-modules/timeline-activity-type/enums/timeline-activity-type-exception-code.enum';
import { TimelineActivityTypeException } from 'src/engine/metadata-modules/timeline-activity-type/timeline-activity-type.exception';
import { fromFlatTimelineActivityTypeToTimelineActivityTypeDto } from 'src/engine/metadata-modules/timeline-activity-type/utils/from-flat-timeline-activity-type-to-timeline-activity-type-dto.util';
import { fromUpdateTimelineActivityTypeInputToFlatTimelineActivityTypeToUpdateOrThrow } from 'src/engine/metadata-modules/timeline-activity-type/utils/from-update-timeline-activity-type-input-to-flat-timeline-activity-type-to-update-or-throw.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class TimelineActivityTypeService {
  constructor(
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly applicationService: ApplicationService,
  ) {}

  async findAll({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<TimelineActivityTypeDTO[]> {
    const { flatTimelineActivityTypeMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: ['flatTimelineActivityTypeMaps'] },
      );

    return Object.values(flatTimelineActivityTypeMaps.byUniversalIdentifier)
      .filter(isDefined)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(fromFlatTimelineActivityTypeToTimelineActivityTypeDto);
  }

  async update({
    input,
    workspaceId,
  }: {
    input: UpdateTimelineActivityTypeInput;
    workspaceId: string;
  }): Promise<TimelineActivityTypeDTO> {
    const { workspaceCustomFlatApplication, flatTimelineActivityTypeMaps } =
      await this.getWorkspaceUpdateContext(workspaceId);
    const flatTimelineActivityTypeToUpdate =
      fromUpdateTimelineActivityTypeInputToFlatTimelineActivityTypeToUpdateOrThrow(
        {
          flatTimelineActivityTypeMaps,
          updateTimelineActivityTypeInput: input,
          callerApplicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
          workspaceCustomApplicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    return this.persistUpdate({
      flatTimelineActivityTypeToUpdate,
      workspaceId,
      applicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
    });
  }

  async reset({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<TimelineActivityTypeDTO> {
    const { workspaceCustomFlatApplication, flatTimelineActivityTypeMaps } =
      await this.getWorkspaceUpdateContext(workspaceId);
    const existingFlatTimelineActivityType = findFlatEntityByIdInFlatEntityMaps(
      { flatEntityId: id, flatEntityMaps: flatTimelineActivityTypeMaps },
    );

    if (!isDefined(existingFlatTimelineActivityType)) {
      throw new TimelineActivityTypeException(
        'Timeline activity type not found',
        TimelineActivityTypeExceptionCode.TIMELINE_ACTIVITY_TYPE_NOT_FOUND,
      );
    }

    if (
      existingFlatTimelineActivityType.applicationUniversalIdentifier ===
      workspaceCustomFlatApplication.universalIdentifier
    ) {
      throw new TimelineActivityTypeException(
        'Custom timeline activity type cannot be reset to default',
        TimelineActivityTypeExceptionCode.TIMELINE_ACTIVITY_TYPE_CANNOT_BE_RESET,
      );
    }

    return this.persistUpdate({
      flatTimelineActivityTypeToUpdate: {
        ...existingFlatTimelineActivityType,
        overrides: null,
        isActive: true,
        updatedAt: new Date().toISOString(),
      },
      workspaceId,
      applicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
    });
  }

  private async getWorkspaceUpdateContext(workspaceId: string) {
    const [applicationContext, metadataMaps] = await Promise.all([
      this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      ),
      this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: ['flatTimelineActivityTypeMaps'] },
      ),
    ]);

    return {
      workspaceCustomFlatApplication:
        applicationContext.workspaceCustomFlatApplication,
      flatTimelineActivityTypeMaps: metadataMaps.flatTimelineActivityTypeMaps,
    };
  }

  private async persistUpdate({
    flatTimelineActivityTypeToUpdate,
    workspaceId,
    applicationUniversalIdentifier,
  }: {
    flatTimelineActivityTypeToUpdate: FlatTimelineActivityType;
    workspaceId: string;
    applicationUniversalIdentifier: string;
  }): Promise<TimelineActivityTypeDTO> {
    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            timelineActivityType: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [flatTimelineActivityTypeToUpdate],
            },
          },
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while updating timeline activity type',
      );
    }

    const { flatTimelineActivityTypeMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: ['flatTimelineActivityTypeMaps'] },
      );

    return fromFlatTimelineActivityTypeToTimelineActivityTypeDto(
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: flatTimelineActivityTypeToUpdate.id,
        flatEntityMaps: flatTimelineActivityTypeMaps,
      }),
    );
  }
}
