import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';

import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { fromCreateViewFieldInputToFlatViewFieldToCreate } from 'src/engine/metadata-modules/flat-view-field/utils/from-create-view-field-input-to-flat-view-field-to-create.util';
import { fromDeleteViewFieldInputToFlatViewFieldOrThrow } from 'src/engine/metadata-modules/flat-view-field/utils/from-delete-view-field-input-to-flat-view-field-or-throw.util';
import { fromDestroyViewFieldInputToFlatViewFieldOrThrow } from 'src/engine/metadata-modules/flat-view-field/utils/from-destroy-view-field-input-to-flat-view-field-or-throw.util';
import { fromUpdateViewFieldInputToFlatViewFieldToUpdateOrThrow } from 'src/engine/metadata-modules/flat-view-field/utils/from-update-view-field-input-to-flat-view-field-to-update-or-throw.util';
import { CreateViewFieldInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/create-view-field.input';
import { DeleteViewFieldInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/delete-view-field.input';
import { DestroyViewFieldInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/destroy-view-field.input';
import { UpdateViewFieldInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/update-view-field.input';
import { ViewFieldDTO } from 'src/engine/metadata-modules/view-field/dtos/view-field.dto';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import {
  ViewFieldException,
  ViewFieldExceptionCode,
} from 'src/engine/metadata-modules/view-field/exceptions/view-field.exception';
import { fromFlatViewFieldToViewFieldDto } from 'src/engine/metadata-modules/view-field/utils/from-flat-view-field-to-view-field-dto.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class ViewFieldService {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    @InjectRepository(ViewFieldEntity)
    private readonly viewFieldRepository: Repository<ViewFieldEntity>,
    private readonly applicationService: ApplicationService,
  ) {}

  async createOne({
    createViewFieldInput,
    workspaceId,
  }: {
    createViewFieldInput: CreateViewFieldInput;
    workspaceId: string;
  }): Promise<ViewFieldDTO> {
    const [createdViewField] = await this.createMany({
      workspaceId,
      createViewFieldInputs: [createViewFieldInput],
    });

    if (!isDefined(createdViewField)) {
      throw new ViewFieldException(
        'Failed to create view field',
        ViewFieldExceptionCode.INVALID_VIEW_FIELD_DATA,
      );
    }

    return createdViewField;
  }

  async createMany({
    createViewFieldInputs,
    workspaceId,
  }: {
    createViewFieldInputs: CreateViewFieldInput[];
    workspaceId: string;
  }): Promise<ViewFieldDTO[]> {
    if (createViewFieldInputs.length === 0) {
      return [];
    }

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    const { flatFieldMetadataMaps, flatViewMaps, flatViewFieldGroupMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: [
            'flatFieldMetadataMaps',
            'flatViewMaps',
            'flatViewFieldGroupMaps',
          ],
        },
      );

    const flatViewFieldsToCreate = createViewFieldInputs.map(
      (createViewFieldInput) =>
        fromCreateViewFieldInputToFlatViewFieldToCreate({
          createViewFieldInput,
          flatApplication: workspaceCustomFlatApplication,
          flatFieldMetadataMaps,
          flatViewMaps,
          flatViewFieldGroupMaps,
        }),
    );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            viewField: {
              flatEntityToCreate: flatViewFieldsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while creating view fields',
      );
    }

    const { flatViewFieldMaps: recomputedExistingFlatViewFieldMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewFieldMaps'],
        },
      );

    return findManyFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityIds: flatViewFieldsToCreate.map((el) => el.id),
      flatEntityMaps: recomputedExistingFlatViewFieldMaps,
    }).map(fromFlatViewFieldToViewFieldDto);
  }

  async updateOne({
    updateViewFieldInput,
    workspaceId,
  }: {
    workspaceId: string;
    updateViewFieldInput: UpdateViewFieldInput;
  }): Promise<ViewFieldDTO> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    const {
      flatViewFieldMaps: existingFlatViewFieldMaps,
      flatViewFieldGroupMaps,
    } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewFieldMaps', 'flatViewFieldGroupMaps'],
        },
      );

    const optimisticallyUpdatedFlatView =
      fromUpdateViewFieldInputToFlatViewFieldToUpdateOrThrow({
        flatViewFieldMaps: existingFlatViewFieldMaps,
        flatViewFieldGroupMaps,
        updateViewFieldInput,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            viewField: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [optimisticallyUpdatedFlatView],
            },
          },
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while updating view field',
      );
    }

    const { flatViewFieldMaps: recomputedExistingFlatViewFieldMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewFieldMaps'],
        },
      );

    return fromFlatViewFieldToViewFieldDto(
      findFlatEntityByUniversalIdentifierOrThrow({
        universalIdentifier: optimisticallyUpdatedFlatView.universalIdentifier,
        flatEntityMaps: recomputedExistingFlatViewFieldMaps,
      }),
    );
  }

  async deleteOne({
    deleteViewFieldInput,
    workspaceId,
  }: {
    deleteViewFieldInput: DeleteViewFieldInput;
    workspaceId: string;
  }): Promise<ViewFieldDTO> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    const { flatViewFieldMaps: existingFlatViewFieldMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewFieldMaps'],
        },
      );

    const optimisticallyUpdatedFlatViewWithDeletedAt =
      fromDeleteViewFieldInputToFlatViewFieldOrThrow({
        flatViewFieldMaps: existingFlatViewFieldMaps,
        deleteViewFieldInput,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            viewField: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [optimisticallyUpdatedFlatViewWithDeletedAt],
            },
          },
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while deleting view field',
      );
    }

    const { flatViewFieldMaps: recomputedExistingFlatViewFieldMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewFieldMaps'],
        },
      );

    return fromFlatViewFieldToViewFieldDto(
      findFlatEntityByUniversalIdentifierOrThrow({
        universalIdentifier:
          optimisticallyUpdatedFlatViewWithDeletedAt.universalIdentifier,
        flatEntityMaps: recomputedExistingFlatViewFieldMaps,
      }),
    );
  }

  async destroyOne({
    destroyViewFieldInput,
    workspaceId,
  }: {
    destroyViewFieldInput: DestroyViewFieldInput;
    workspaceId: string;
  }): Promise<ViewFieldDTO> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    const { flatViewFieldMaps: existingFlatViewFieldMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewFieldMaps'],
        },
      );

    const existingViewFieldToDelete =
      fromDestroyViewFieldInputToFlatViewFieldOrThrow({
        destroyViewFieldInput,
        flatViewFieldMaps: existingFlatViewFieldMaps,
      });

    const existingFlatViewField = findFlatEntityByUniversalIdentifierOrThrow({
      universalIdentifier: existingViewFieldToDelete.universalIdentifier,
      flatEntityMaps: existingFlatViewFieldMaps,
    });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            viewField: {
              flatEntityToCreate: [],
              flatEntityToDelete: [existingViewFieldToDelete],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while deleting view field',
      );
    }

    return fromFlatViewFieldToViewFieldDto({
      ...existingFlatViewField,
      deletedAt: new Date().toISOString(),
    });
  }

  async findByWorkspaceId(workspaceId: string): Promise<ViewFieldEntity[]> {
    return this.viewFieldRepository.find({
      where: {
        workspaceId,
        deletedAt: IsNull(),
      },
      order: { position: 'ASC' },
      relations: ['workspace', 'view'],
    });
  }

  async findByViewId(
    workspaceId: string,
    viewId: string,
  ): Promise<ViewFieldEntity[]> {
    return this.viewFieldRepository.find({
      where: {
        workspaceId,
        viewId,
        deletedAt: IsNull(),
      },
      order: { position: 'ASC' },
      relations: ['workspace', 'view'],
    });
  }

  async findById(
    id: string,
    workspaceId: string,
  ): Promise<ViewFieldEntity | null> {
    const viewField = await this.viewFieldRepository.findOne({
      where: {
        id,
        workspaceId,
        deletedAt: IsNull(),
      },
      relations: ['workspace', 'view'],
    });

    return viewField || null;
  }
}
