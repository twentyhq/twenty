import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';

import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { fromCreateViewFieldGroupInputToFlatViewFieldGroupToCreate } from 'src/engine/metadata-modules/flat-view-field-group/utils/from-create-view-field-group-input-to-flat-view-field-group-to-create.util';
import { fromDeleteViewFieldGroupInputToFlatViewFieldGroupOrThrow } from 'src/engine/metadata-modules/flat-view-field-group/utils/from-delete-view-field-group-input-to-flat-view-field-group-or-throw.util';
import { fromDestroyViewFieldGroupInputToFlatViewFieldGroupOrThrow } from 'src/engine/metadata-modules/flat-view-field-group/utils/from-destroy-view-field-group-input-to-flat-view-field-group-or-throw.util';
import { fromUpdateViewFieldGroupInputToFlatViewFieldGroupToUpdateOrThrow } from 'src/engine/metadata-modules/flat-view-field-group/utils/from-update-view-field-group-input-to-flat-view-field-group-to-update-or-throw.util';
import { CreateViewFieldGroupInput } from 'src/engine/metadata-modules/view-field-group/dtos/inputs/create-view-field-group.input';
import { DeleteViewFieldGroupInput } from 'src/engine/metadata-modules/view-field-group/dtos/inputs/delete-view-field-group.input';
import { DestroyViewFieldGroupInput } from 'src/engine/metadata-modules/view-field-group/dtos/inputs/destroy-view-field-group.input';
import { UpdateViewFieldGroupInput } from 'src/engine/metadata-modules/view-field-group/dtos/inputs/update-view-field-group.input';
import { ViewFieldGroupDTO } from 'src/engine/metadata-modules/view-field-group/dtos/view-field-group.dto';
import { ViewFieldGroupEntity } from 'src/engine/metadata-modules/view-field-group/entities/view-field-group.entity';
import {
  ViewFieldGroupException,
  ViewFieldGroupExceptionCode,
} from 'src/engine/metadata-modules/view-field-group/exceptions/view-field-group.exception';
import { fromFlatViewFieldGroupToViewFieldGroupDto } from 'src/engine/metadata-modules/view-field-group/utils/from-flat-view-field-group-to-view-field-group-dto.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class ViewFieldGroupService {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    @InjectRepository(ViewFieldGroupEntity)
    private readonly viewFieldGroupRepository: Repository<ViewFieldGroupEntity>,
    private readonly applicationService: ApplicationService,
  ) {}

  async createOne({
    createViewFieldGroupInput,
    workspaceId,
  }: {
    createViewFieldGroupInput: CreateViewFieldGroupInput;
    workspaceId: string;
  }): Promise<ViewFieldGroupDTO> {
    const [createdViewFieldGroup] = await this.createMany({
      workspaceId,
      createViewFieldGroupInputs: [createViewFieldGroupInput],
    });

    if (!isDefined(createdViewFieldGroup)) {
      throw new ViewFieldGroupException(
        'Failed to create view field group',
        ViewFieldGroupExceptionCode.INVALID_VIEW_FIELD_GROUP_DATA,
      );
    }

    return createdViewFieldGroup;
  }

  async createMany({
    createViewFieldGroupInputs,
    workspaceId,
  }: {
    createViewFieldGroupInputs: CreateViewFieldGroupInput[];
    workspaceId: string;
  }): Promise<ViewFieldGroupDTO[]> {
    if (createViewFieldGroupInputs.length === 0) {
      return [];
    }

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    const { flatViewMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewMaps'],
        },
      );

    const flatViewFieldGroupsToCreate = createViewFieldGroupInputs.map(
      (createViewFieldGroupInput) =>
        fromCreateViewFieldGroupInputToFlatViewFieldGroupToCreate({
          createViewFieldGroupInput,
          flatApplication: workspaceCustomFlatApplication,
          flatViewMaps,
        }),
    );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            viewFieldGroup: {
              flatEntityToCreate: flatViewFieldGroupsToCreate,
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
        'Multiple validation errors occurred while creating view field groups',
      );
    }

    const { flatViewFieldGroupMaps: recomputedExistingFlatViewFieldGroupMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewFieldGroupMaps'],
        },
      );

    return findManyFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityIds: flatViewFieldGroupsToCreate.map((entity) => entity.id),
      flatEntityMaps: recomputedExistingFlatViewFieldGroupMaps,
    }).map(fromFlatViewFieldGroupToViewFieldGroupDto);
  }

  async updateOne({
    updateViewFieldGroupInput,
    workspaceId,
  }: {
    workspaceId: string;
    updateViewFieldGroupInput: UpdateViewFieldGroupInput;
  }): Promise<ViewFieldGroupDTO> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    const { flatViewFieldGroupMaps: existingFlatViewFieldGroupMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewFieldGroupMaps'],
        },
      );

    const optimisticallyUpdatedFlatViewFieldGroup =
      fromUpdateViewFieldGroupInputToFlatViewFieldGroupToUpdateOrThrow({
        flatViewFieldGroupMaps: existingFlatViewFieldGroupMaps,
        updateViewFieldGroupInput,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            viewFieldGroup: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [optimisticallyUpdatedFlatViewFieldGroup],
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
        'Multiple validation errors occurred while updating view field group',
      );
    }

    const { flatViewFieldGroupMaps: recomputedExistingFlatViewFieldGroupMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewFieldGroupMaps'],
        },
      );

    return fromFlatViewFieldGroupToViewFieldGroupDto(
      findFlatEntityByUniversalIdentifierOrThrow({
        universalIdentifier:
          optimisticallyUpdatedFlatViewFieldGroup.universalIdentifier,
        flatEntityMaps: recomputedExistingFlatViewFieldGroupMaps,
      }),
    );
  }

  async deleteOne({
    deleteViewFieldGroupInput,
    workspaceId,
  }: {
    deleteViewFieldGroupInput: DeleteViewFieldGroupInput;
    workspaceId: string;
  }): Promise<ViewFieldGroupDTO> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    const { flatViewFieldGroupMaps: existingFlatViewFieldGroupMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewFieldGroupMaps'],
        },
      );

    const optimisticallyUpdatedFlatViewFieldGroupWithDeletedAt =
      fromDeleteViewFieldGroupInputToFlatViewFieldGroupOrThrow({
        flatViewFieldGroupMaps: existingFlatViewFieldGroupMaps,
        deleteViewFieldGroupInput,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            viewFieldGroup: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [
                optimisticallyUpdatedFlatViewFieldGroupWithDeletedAt,
              ],
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
        'Multiple validation errors occurred while deleting view field group',
      );
    }

    const { flatViewFieldGroupMaps: recomputedExistingFlatViewFieldGroupMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewFieldGroupMaps'],
        },
      );

    return fromFlatViewFieldGroupToViewFieldGroupDto(
      findFlatEntityByUniversalIdentifierOrThrow({
        universalIdentifier:
          optimisticallyUpdatedFlatViewFieldGroupWithDeletedAt.universalIdentifier,
        flatEntityMaps: recomputedExistingFlatViewFieldGroupMaps,
      }),
    );
  }

  async destroyOne({
    destroyViewFieldGroupInput,
    workspaceId,
  }: {
    destroyViewFieldGroupInput: DestroyViewFieldGroupInput;
    workspaceId: string;
  }): Promise<ViewFieldGroupDTO> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    const { flatViewFieldGroupMaps: existingFlatViewFieldGroupMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewFieldGroupMaps'],
        },
      );

    const existingViewFieldGroupToDelete =
      fromDestroyViewFieldGroupInputToFlatViewFieldGroupOrThrow({
        destroyViewFieldGroupInput,
        flatViewFieldGroupMaps: existingFlatViewFieldGroupMaps,
      });

    const existingFlatViewFieldGroup =
      findFlatEntityByUniversalIdentifierOrThrow({
        universalIdentifier: existingViewFieldGroupToDelete.universalIdentifier,
        flatEntityMaps: existingFlatViewFieldGroupMaps,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            viewFieldGroup: {
              flatEntityToCreate: [],
              flatEntityToDelete: [existingViewFieldGroupToDelete],
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
        'Multiple validation errors occurred while destroying view field group',
      );
    }

    return fromFlatViewFieldGroupToViewFieldGroupDto({
      ...existingFlatViewFieldGroup,
      deletedAt: new Date().toISOString(),
    });
  }

  async findByViewId(
    workspaceId: string,
    viewId: string,
  ): Promise<ViewFieldGroupEntity[]> {
    return this.viewFieldGroupRepository.find({
      where: {
        workspaceId,
        viewId,
        deletedAt: IsNull(),
      },
      order: { position: 'ASC' },
    });
  }

  async findById(
    id: string,
    workspaceId: string,
  ): Promise<ViewFieldGroupEntity | null> {
    const viewFieldGroup = await this.viewFieldGroupRepository.findOne({
      where: {
        id,
        workspaceId,
        deletedAt: IsNull(),
      },
    });

    return viewFieldGroup || null;
  }
}
