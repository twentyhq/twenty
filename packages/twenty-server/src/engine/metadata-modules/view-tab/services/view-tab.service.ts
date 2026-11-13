import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { IsNull } from 'typeorm';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { fromCreateViewTabInputToFlatViewTabToCreate } from 'src/engine/metadata-modules/flat-view-tab/utils/from-create-view-tab-input-to-flat-view-tab-to-create.util';
import { fromDestroyViewTabInputToFlatViewTabOrThrow } from 'src/engine/metadata-modules/flat-view-tab/utils/from-destroy-view-tab-input-to-flat-view-tab-or-throw.util';
import { fromUpdateViewTabInputToFlatViewTabToUpdateOrThrow } from 'src/engine/metadata-modules/flat-view-tab/utils/from-update-view-tab-input-to-flat-view-tab-to-update-or-throw.util';
import { CreateViewTabInput } from 'src/engine/metadata-modules/view-tab/dtos/inputs/create-view-tab.input';
import { DeleteViewTabInput } from 'src/engine/metadata-modules/view-tab/dtos/inputs/delete-view-tab.input';
import { DestroyViewTabInput } from 'src/engine/metadata-modules/view-tab/dtos/inputs/destroy-view-tab.input';
import { UpdateViewTabInput } from 'src/engine/metadata-modules/view-tab/dtos/inputs/update-view-tab.input';
import { ViewTabDTO } from 'src/engine/metadata-modules/view-tab/dtos/view-tab.dto';
import { ViewTabEntity } from 'src/engine/metadata-modules/view-tab/entities/view-tab.entity';
import {
  ViewTabException,
  ViewTabExceptionCode,
} from 'src/engine/metadata-modules/view-tab/exceptions/view-tab.exception';
import { fromFlatViewTabToViewTabDto } from 'src/engine/metadata-modules/view-tab/utils/from-flat-view-tab-to-view-tab-dto.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class ViewTabService {
  constructor(
    @InjectWorkspaceScopedRepository(ViewTabEntity)
    private readonly viewTabRepository: WorkspaceScopedRepository<ViewTabEntity>,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
  ) {}

  async createOne({
    createViewTabInput,
    workspaceId,
  }: {
    createViewTabInput: CreateViewTabInput;
    workspaceId: string;
  }): Promise<ViewTabDTO> {
    const [createdViewTab] = await this.createMany({
      workspaceId,
      createViewTabInputs: [createViewTabInput],
    });

    if (!isDefined(createdViewTab)) {
      throw new ViewTabException(
        'Failed to create view tab',
        ViewTabExceptionCode.INVALID_VIEW_TAB_DATA,
      );
    }

    return createdViewTab;
  }

  async createMany({
    createViewTabInputs,
    workspaceId,
  }: {
    createViewTabInputs: CreateViewTabInput[];
    workspaceId: string;
  }): Promise<ViewTabDTO[]> {
    if (createViewTabInputs.length === 0) {
      return [];
    }

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    const { flatViewMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewMaps'],
        },
      );

    const flatViewTabsToCreate = createViewTabInputs.map((createViewTabInput) =>
      fromCreateViewTabInputToFlatViewTabToCreate({
        createViewTabInput,
        flatApplication: workspaceCustomFlatApplication,
        flatViewMaps,
      }),
    );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            viewTab: {
              flatEntityToCreate: flatViewTabsToCreate,
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

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while creating view tabs',
      );
    }

    const { flatViewTabMaps: recomputedExistingFlatViewTabMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewTabMaps'],
        },
      );

    return findManyFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityIds: flatViewTabsToCreate.map((el) => el.id),
      flatEntityMaps: recomputedExistingFlatViewTabMaps,
    }).map(fromFlatViewTabToViewTabDto);
  }

  async updateOne({
    updateViewTabInput,
    workspaceId,
  }: {
    workspaceId: string;
    updateViewTabInput: UpdateViewTabInput;
  }): Promise<ViewTabDTO> {
    const [updatedViewTab] = await this.updateMany({
      updateViewTabInputs: [updateViewTabInput],
      workspaceId,
    });

    if (!isDefined(updatedViewTab)) {
      throw new ViewTabException(
        'Failed to update view tab',
        ViewTabExceptionCode.INVALID_VIEW_TAB_DATA,
      );
    }

    return updatedViewTab;
  }

  async updateMany({
    updateViewTabInputs,
    workspaceId,
  }: {
    updateViewTabInputs: UpdateViewTabInput[];
    workspaceId: string;
  }): Promise<ViewTabDTO[]> {
    if (updateViewTabInputs.length === 0) {
      return [];
    }

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    const { flatViewTabMaps: existingFlatViewTabMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewTabMaps'],
        },
      );

    const flatViewTabsToUpdate = updateViewTabInputs.map((updateViewTabInput) =>
      fromUpdateViewTabInputToFlatViewTabToUpdateOrThrow({
        flatViewTabMaps: existingFlatViewTabMaps,
        updateViewTabInput,
      }),
    );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            viewTab: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: flatViewTabsToUpdate,
            },
          },
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while updating view tabs',
      );
    }

    const { flatViewTabMaps: recomputedExistingFlatViewTabMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewTabMaps'],
        },
      );

    return updateViewTabInputs.map(({ id }) =>
      fromFlatViewTabToViewTabDto(
        findFlatEntityByIdInFlatEntityMapsOrThrow({
          flatEntityId: id,
          flatEntityMaps: recomputedExistingFlatViewTabMaps,
        }),
      ),
    );
  }

  async deleteOne({
    deleteViewTabInput,
    workspaceId,
  }: {
    deleteViewTabInput: DeleteViewTabInput;
    workspaceId: string;
  }): Promise<ViewTabDTO> {
    return this.destroyOne({
      destroyViewTabInput: deleteViewTabInput,
      workspaceId,
    });
  }

  async destroyOne({
    destroyViewTabInput,
    workspaceId,
  }: {
    destroyViewTabInput: DestroyViewTabInput;
    workspaceId: string;
  }): Promise<ViewTabDTO> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    const { flatViewTabMaps: existingFlatViewTabMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatViewTabMaps'],
        },
      );

    const existingViewTabToDelete = fromDestroyViewTabInputToFlatViewTabOrThrow(
      {
        destroyViewTabInput,
        flatViewTabMaps: existingFlatViewTabMaps,
      },
    );

    const existingFlatViewTab = findFlatEntityByUniversalIdentifierOrThrow({
      universalIdentifier: existingViewTabToDelete.universalIdentifier,
      flatEntityMaps: existingFlatViewTabMaps,
    });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            viewTab: {
              flatEntityToCreate: [],
              flatEntityToDelete: [existingViewTabToDelete],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while destroying view tab',
      );
    }

    return fromFlatViewTabToViewTabDto({
      ...existingFlatViewTab,
      deletedAt: new Date().toISOString(),
    });
  }

  async findByWorkspaceId(workspaceId: string): Promise<ViewTabEntity[]> {
    return this.viewTabRepository.find(workspaceId, {
      where: {
        deletedAt: IsNull(),
      },
      order: { position: 'ASC', id: 'ASC' },
      relations: ['workspace', 'view'],
    });
  }

  async findByViewId(
    workspaceId: string,
    viewId: string,
  ): Promise<ViewTabEntity[]> {
    return this.viewTabRepository.find(workspaceId, {
      where: {
        viewId,
        deletedAt: IsNull(),
      },
      order: { position: 'ASC', id: 'ASC' },
      relations: ['workspace', 'view'],
    });
  }

  async findById(
    id: string,
    workspaceId: string,
  ): Promise<ViewTabEntity | null> {
    const viewTab = await this.viewTabRepository.findOne(workspaceId, {
      where: {
        id,
        deletedAt: IsNull(),
      },
      relations: ['workspace', 'view'],
    });

    return viewTab || null;
  }
}
