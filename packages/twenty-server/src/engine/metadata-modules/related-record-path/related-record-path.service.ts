/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatRelatedRecordPath } from 'src/engine/metadata-modules/flat-related-record-path/types/flat-related-record-path.type';
import { fromCreateRelatedRecordPathInputToFlatRelatedRecordPathToCreateOrThrow } from 'src/engine/metadata-modules/flat-related-record-path/utils/from-create-related-record-path-input-to-flat-related-record-path-to-create-or-throw.util';
import { fromFlatRelatedRecordPathToRelatedRecordPathDto } from 'src/engine/metadata-modules/flat-related-record-path/utils/from-flat-related-record-path-to-related-record-path-dto.util';
import { type CreateRelatedRecordPathInput } from 'src/engine/metadata-modules/related-record-path/dtos/create-related-record-path.input';
import { type RelatedRecordPathDTO } from 'src/engine/metadata-modules/related-record-path/dtos/related-record-path.dto';
import {
  RelatedRecordPathException,
  RelatedRecordPathExceptionCode,
} from 'src/engine/metadata-modules/related-record-path/related-record-path.exception';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class RelatedRecordPathService {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
  ) {}

  private getFlatMaps(workspaceId: string) {
    return this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      {
        workspaceId,
        flatMapsKeys: [
          'flatRelatedRecordPathMaps',
          'flatObjectMetadataMaps',
          'flatFieldMetadataMaps',
        ],
      },
    );
  }

  private async runRelatedRecordPathMigrationOrThrow({
    workspaceId,
    flatEntityToCreate,
    flatEntityToDelete,
    errorMessage,
  }: {
    workspaceId: string;
    flatEntityToCreate: FlatRelatedRecordPath[];
    flatEntityToDelete: FlatRelatedRecordPath[];
    errorMessage: string;
  }): Promise<void> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            relatedRecordPath: {
              flatEntityToCreate,
              flatEntityToUpdate: [],
              flatEntityToDelete,
            },
          },
          workspaceId,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        errorMessage,
      );
    }
  }

  async findAll({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<RelatedRecordPathDTO[]> {
    const { flatRelatedRecordPathMaps } = await this.getFlatMaps(workspaceId);

    return Object.values(flatRelatedRecordPathMaps.byUniversalIdentifier)
      .filter(isDefined)
      .sort(
        (left, right) =>
          left.createdAt.localeCompare(right.createdAt) ||
          left.id.localeCompare(right.id),
      )
      .map(fromFlatRelatedRecordPathToRelatedRecordPathDto);
  }

  async create({
    input,
    workspaceId,
  }: {
    input: CreateRelatedRecordPathInput;
    workspaceId: string;
  }): Promise<RelatedRecordPathDTO> {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.getFlatMaps(workspaceId);

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const flatRelatedRecordPathToCreate =
      fromCreateRelatedRecordPathInputToFlatRelatedRecordPathToCreateOrThrow({
        createRelatedRecordPathInput: input,
        workspaceId,
        flatApplication: workspaceCustomFlatApplication,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      });

    await this.runRelatedRecordPathMigrationOrThrow({
      workspaceId,
      flatEntityToCreate: [flatRelatedRecordPathToCreate],
      flatEntityToDelete: [],
      errorMessage:
        'Multiple validation errors occurred while creating related record path',
    });

    const { flatRelatedRecordPathMaps } = await this.getFlatMaps(workspaceId);

    return fromFlatRelatedRecordPathToRelatedRecordPathDto(
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: flatRelatedRecordPathToCreate.id,
        flatEntityMaps: flatRelatedRecordPathMaps,
      }),
    );
  }

  async delete({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<RelatedRecordPathDTO> {
    const { flatRelatedRecordPathMaps } = await this.getFlatMaps(workspaceId);

    const existingFlatRelatedRecordPath = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: id,
      flatEntityMaps: flatRelatedRecordPathMaps,
    });

    if (!isDefined(existingFlatRelatedRecordPath)) {
      throw new RelatedRecordPathException(
        'Related record path not found',
        RelatedRecordPathExceptionCode.RELATED_RECORD_PATH_NOT_FOUND,
      );
    }

    await this.runRelatedRecordPathMigrationOrThrow({
      workspaceId,
      flatEntityToCreate: [],
      flatEntityToDelete: [existingFlatRelatedRecordPath],
      errorMessage:
        'Multiple validation errors occurred while deleting related record path',
    });

    return fromFlatRelatedRecordPathToRelatedRecordPathDto(
      existingFlatRelatedRecordPath,
    );
  }
}
