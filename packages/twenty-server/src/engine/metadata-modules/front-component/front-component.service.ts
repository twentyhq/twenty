import { Injectable } from '@nestjs/common';

import { type Readable } from 'stream';

import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFrontComponent } from 'src/engine/metadata-modules/flat-front-component/types/flat-front-component.type';
import { fromCreateFrontComponentInputToFlatFrontComponentToCreate } from 'src/engine/metadata-modules/flat-front-component/utils/from-create-front-component-input-to-flat-front-component-to-create.util';
import { fromFlatFrontComponentToFrontComponentDto } from 'src/engine/metadata-modules/flat-front-component/utils/from-flat-front-component-to-front-component-dto.util';
import { fromUpdateFrontComponentInputToFlatFrontComponentToUpdateOrThrow } from 'src/engine/metadata-modules/flat-front-component/utils/from-update-front-component-input-to-flat-front-component-to-update-or-throw.util';
import { type CreateFrontComponentInput } from 'src/engine/metadata-modules/front-component/dtos/create-front-component.input';
import { type FrontComponentDTO } from 'src/engine/metadata-modules/front-component/dtos/front-component.dto';
import { type UpdateFrontComponentInput } from 'src/engine/metadata-modules/front-component/dtos/update-front-component.input';
import {
  FrontComponentException,
  FrontComponentExceptionCode,
} from 'src/engine/metadata-modules/front-component/front-component.exception';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class FrontComponentService {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
    private readonly fileStorageService: FileStorageService,
  ) {}

  async findAll(workspaceId: string): Promise<FrontComponentDTO[]> {
    const { flatFrontComponentMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatFrontComponentMaps'],
        },
      );

    return Object.values(flatFrontComponentMaps.byUniversalIdentifier)
      .filter(isDefined)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(fromFlatFrontComponentToFrontComponentDto);
  }

  async findById(
    id: string,
    workspaceId: string,
  ): Promise<FrontComponentDTO | null> {
    const { flatFrontComponentMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatFrontComponentMaps'],
        },
      );

    const flatFrontComponent = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: id,
      flatEntityMaps: flatFrontComponentMaps,
    });

    if (!isDefined(flatFrontComponent)) {
      return null;
    }

    return fromFlatFrontComponentToFrontComponentDto(flatFrontComponent);
  }

  async createOne({
    input,
    workspaceId,
    ownerFlatApplication,
  }: {
    input: Omit<CreateFrontComponentInput, 'applicationId'>;
    workspaceId: string;
    ownerFlatApplication?: FlatApplication;
  }): Promise<FlatFrontComponent> {
    const resolvedOwnerFlatApplication =
      ownerFlatApplication ??
      (
        await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
          { workspaceId },
        )
      ).workspaceCustomFlatApplication;

    const flatFrontComponentToCreate =
      fromCreateFrontComponentInputToFlatFrontComponentToCreate({
        createFrontComponentInput: input,
        workspaceId,
        flatApplication: resolvedOwnerFlatApplication,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            frontComponent: {
              flatEntityToCreate: [flatFrontComponentToCreate],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier:
            resolvedOwnerFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while creating front component',
      );
    }

    const { flatFrontComponentMaps: recomputedFlatFrontComponentMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatFrontComponentMaps'],
        },
      );

    return findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: flatFrontComponentToCreate.id,
      flatEntityMaps: recomputedFlatFrontComponentMaps,
    });
  }

  async updateOne({
    id,
    update,
    workspaceId,
    ownerFlatApplication,
  }: {
    id: string;
    update: UpdateFrontComponentInput['update'];
    workspaceId: string;
    ownerFlatApplication?: FlatApplication;
  }): Promise<FlatFrontComponent> {
    const resolvedOwnerFlatApplication =
      ownerFlatApplication ??
      (
        await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
          { workspaceId },
        )
      ).workspaceCustomFlatApplication;

    const { flatFrontComponentMaps: existingFlatFrontComponentMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatFrontComponentMaps'],
        },
      );

    const flatFrontComponentToUpdate =
      fromUpdateFrontComponentInputToFlatFrontComponentToUpdateOrThrow({
        flatFrontComponentMaps: existingFlatFrontComponentMaps,
        updateFrontComponentInput: { id, update },
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            frontComponent: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [flatFrontComponentToUpdate],
            },
          },
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier:
            resolvedOwnerFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while updating front component',
      );
    }

    const { flatFrontComponentMaps: recomputedFlatFrontComponentMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatFrontComponentMaps'],
        },
      );

    return findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: id,
      flatEntityMaps: recomputedFlatFrontComponentMaps,
    });
  }

  async destroyOne({
    id,
    workspaceId,
    isSystemBuild = false,
    ownerFlatApplication,
  }: {
    id: string;
    workspaceId: string;
    isSystemBuild?: boolean;
    ownerFlatApplication?: FlatApplication;
  }): Promise<FlatFrontComponent> {
    const resolvedOwnerFlatApplication =
      ownerFlatApplication ??
      (
        await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
          { workspaceId },
        )
      ).workspaceCustomFlatApplication;

    const { flatFrontComponentMaps: existingFlatFrontComponentMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatFrontComponentMaps'],
        },
      );

    const existingFlatFrontComponent = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: id,
      flatEntityMaps: existingFlatFrontComponentMaps,
    });

    if (!isDefined(existingFlatFrontComponent)) {
      throw new FrontComponentException(
        'Front component to destroy not found',
        FrontComponentExceptionCode.FRONT_COMPONENT_NOT_FOUND,
      );
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            frontComponent: {
              flatEntityToCreate: [],
              flatEntityToDelete: [existingFlatFrontComponent],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          isSystemBuild,
          applicationUniversalIdentifier:
            resolvedOwnerFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while destroying front component',
      );
    }

    return existingFlatFrontComponent;
  }

  async findByIdOrThrow(
    id: string,
    workspaceId: string,
  ): Promise<FrontComponentDTO> {
    const frontComponent = await this.findById(id, workspaceId);

    if (!isDefined(frontComponent)) {
      throw new FrontComponentException(
        'Front component not found',
        FrontComponentExceptionCode.FRONT_COMPONENT_NOT_FOUND,
      );
    }

    return frontComponent;
  }

  async getBuiltComponentStream({
    frontComponentId,
    workspaceId,
  }: {
    frontComponentId: string;
    workspaceId: string;
  }): Promise<Readable> {
    const frontComponent = await this.findByIdOrThrow(
      frontComponentId,
      workspaceId,
    );

    const application = await this.applicationService.findOneApplicationOrThrow(
      {
        id: frontComponent.applicationId,
        workspaceId,
      },
    );

    return this.fileStorageService.readFile({
      workspaceId,
      applicationUniversalIdentifier: application.universalIdentifier,
      fileFolder: FileFolder.BuiltFrontComponent,
      resourcePath: frontComponent.builtComponentPath,
    });
  }
}
