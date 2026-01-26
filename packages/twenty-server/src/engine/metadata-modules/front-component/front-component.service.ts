import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { fromCreateFrontComponentInputToFlatFrontComponentToCreate } from 'src/engine/metadata-modules/flat-front-component/utils/from-create-front-component-input-to-flat-front-component-to-create.util';
import { fromDeleteFrontComponentInputToFlatFrontComponentOrThrow } from 'src/engine/metadata-modules/flat-front-component/utils/from-delete-front-component-input-to-flat-front-component-or-throw.util';
import { fromFlatFrontComponentToFrontComponentDto } from 'src/engine/metadata-modules/flat-front-component/utils/from-flat-front-component-to-front-component-dto.util';
import { fromUpdateFrontComponentInputToFlatFrontComponentToUpdateOrThrow } from 'src/engine/metadata-modules/flat-front-component/utils/from-update-front-component-input-to-flat-front-component-to-update-or-throw.util';
import { type CreateFrontComponentInput } from 'src/engine/metadata-modules/front-component/dtos/create-front-component.input';
import { type FrontComponentCodeDTO } from 'src/engine/metadata-modules/front-component/dtos/front-component-code.dto';
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
  ) {}

  async findAll(workspaceId: string): Promise<FrontComponentDTO[]> {
    const { flatFrontComponentMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatFrontComponentMaps'],
        },
      );

    return Object.values(flatFrontComponentMaps.byId)
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

  async create(
    input: CreateFrontComponentInput,
    workspaceId: string,
  ): Promise<FrontComponentDTO> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const flatFrontComponentToCreate =
      fromCreateFrontComponentInputToFlatFrontComponentToCreate({
        createFrontComponentInput: input,
        workspaceId,
        applicationId: workspaceCustomFlatApplication.id,
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
        },
      );

    if (isDefined(validateAndBuildResult)) {
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

    return fromFlatFrontComponentToFrontComponentDto(
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: flatFrontComponentToCreate.id,
        flatEntityMaps: recomputedFlatFrontComponentMaps,
      }),
    );
  }

  async update(
    input: UpdateFrontComponentInput,
    workspaceId: string,
  ): Promise<FrontComponentDTO> {
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
        updateFrontComponentInput: input,
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
        },
      );

    if (isDefined(validateAndBuildResult)) {
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

    return fromFlatFrontComponentToFrontComponentDto(
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: input.id,
        flatEntityMaps: recomputedFlatFrontComponentMaps,
      }),
    );
  }

  async delete(id: string, workspaceId: string): Promise<FrontComponentDTO> {
    const { flatFrontComponentMaps: existingFlatFrontComponentMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatFrontComponentMaps'],
        },
      );

    const flatFrontComponentToDelete =
      fromDeleteFrontComponentInputToFlatFrontComponentOrThrow({
        flatFrontComponentMaps: existingFlatFrontComponentMaps,
        frontComponentId: id,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            frontComponent: {
              flatEntityToCreate: [],
              flatEntityToDelete: [flatFrontComponentToDelete],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          isSystemBuild: false,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while deleting front component',
      );
    }

    return fromFlatFrontComponentToFrontComponentDto(
      flatFrontComponentToDelete,
    );
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

  async getFrontComponentCode(
    _id: string,
    _workspaceId: string,
  ): Promise<FrontComponentCodeDTO> {
    // TODO: get the source code from the front component here, we will implement a mock version for now
    const sourceCode = '';

    return { sourceCode };
  }
}
