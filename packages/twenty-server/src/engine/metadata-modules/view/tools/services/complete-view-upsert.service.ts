import { Injectable } from '@nestjs/common';

import { t } from '@lingui/core/macro';
import {
  AggregateOperations,
  ViewCalendarLayout,
  ViewType,
  ViewVisibility,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatEntityToCreateDeleteUpdate } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-to-create-delete-update.type';
import {
  buildCompleteViewChildrenFlatOperations,
  type CompleteViewFieldSpec,
  type CompleteViewFilterSpec,
  type CompleteViewSortSpec,
} from 'src/engine/metadata-modules/flat-view/utils/build-complete-view-children-flat-operations.util';
import { fromCreateViewInputToFlatViewToCreate } from 'src/engine/metadata-modules/flat-view/utils/from-create-view-input-to-flat-view-to-create.util';
import { fromUpdateViewInputToFlatViewToUpdateOrThrow } from 'src/engine/metadata-modules/flat-view/utils/from-update-view-input-to-flat-view-to-update-or-throw.util';
import { ViewDTO } from 'src/engine/metadata-modules/view/dtos/view.dto';
import {
  ViewException,
  ViewExceptionCode,
} from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { ViewService } from 'src/engine/metadata-modules/view/services/view.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

type ViewUpsertFlatEntityOperations = {
  view?: FlatEntityToCreateDeleteUpdate<'view'>;
  viewGroup?: FlatEntityToCreateDeleteUpdate<'viewGroup'>;
  viewField?: FlatEntityToCreateDeleteUpdate<'viewField'>;
  viewFilter?: FlatEntityToCreateDeleteUpdate<'viewFilter'>;
  viewSort?: FlatEntityToCreateDeleteUpdate<'viewSort'>;
};

type ViewUpsertRootOperations = Pick<
  ViewUpsertFlatEntityOperations,
  'view' | 'viewGroup'
> & {
  viewId: string;
  viewUniversalIdentifier?: string;
};

// Backs the AI `upsert_complete_view` tool: upserts a view together with its
// fields, filters and sorts in a single workspace migration.
@Injectable()
export class CompleteViewUpsertService {
  constructor(
    private readonly viewService: ViewService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
  ) {}

  async upsertCompleteView({
    workspaceId,
    userWorkspaceId,
    existingViewId,
    objectMetadataId,
    name,
    icon,
    type,
    visibility,
    mainGroupByFieldMetadataId,
    kanbanAggregateOperation,
    kanbanAggregateOperationFieldMetadataId,
    calendarLayout,
    calendarFieldMetadataId,
    calendarEndFieldMetadataId,
    fields,
    filters,
    sorts,
  }: {
    workspaceId: string;
    userWorkspaceId?: string;
    existingViewId?: string;
    objectMetadataId?: string;
    name?: string;
    icon?: string;
    type?: ViewType;
    visibility?: ViewVisibility;
    mainGroupByFieldMetadataId?: string;
    kanbanAggregateOperation?: AggregateOperations;
    kanbanAggregateOperationFieldMetadataId?: string;
    calendarLayout?: ViewCalendarLayout;
    calendarFieldMetadataId?: string;
    calendarEndFieldMetadataId?: string;
    fields?: CompleteViewFieldSpec[];
    filters?: CompleteViewFilterSpec[];
    sorts?: CompleteViewSortSpec[];
  }): Promise<ViewDTO> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    const applicationUniversalIdentifier =
      workspaceCustomFlatApplication.universalIdentifier;

    const {
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
      flatViewMaps,
      flatViewGroupMaps,
      flatViewFieldMaps,
      flatViewFilterMaps,
      flatViewSortMaps,
      flatViewFieldGroupMaps,
      flatViewFilterGroupMaps,
    } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: [
            'flatFieldMetadataMaps',
            'flatObjectMetadataMaps',
            'flatViewMaps',
            'flatViewGroupMaps',
            'flatViewFieldMaps',
            'flatViewFilterMaps',
            'flatViewSortMaps',
            'flatViewFieldGroupMaps',
            'flatViewFilterGroupMaps',
          ],
        },
      );

    const isCreatingView = !isDefined(existingViewId);

    const rootOperations = isDefined(existingViewId)
      ? this.buildUpdateViewRootOperationsOrThrow({
          existingViewId,
          name,
          icon,
          calendarEndFieldMetadataId,
          userWorkspaceId,
          applicationUniversalIdentifier,
          flatViewMaps,
          flatViewGroupMaps,
          flatFieldMetadataMaps,
        })
      : this.buildCreateViewRootOperationsOrThrow({
          objectMetadataId,
          name,
          icon,
          type,
          visibility,
          mainGroupByFieldMetadataId,
          kanbanAggregateOperation,
          kanbanAggregateOperationFieldMetadataId,
          calendarLayout,
          calendarFieldMetadataId,
          calendarEndFieldMetadataId,
          userWorkspaceId,
          flatApplication: workspaceCustomFlatApplication,
          flatFieldMetadataMaps,
          flatObjectMetadataMaps,
        });

    const { viewId, viewUniversalIdentifier } = rootOperations;

    const flatViewMapsForChildren =
      isCreatingView && isDefined(viewUniversalIdentifier)
        ? {
            ...flatViewMaps,
            universalIdentifierById: {
              ...flatViewMaps.universalIdentifierById,
              [viewId]: viewUniversalIdentifier,
            },
          }
        : flatViewMaps;

    const childrenOperations = buildCompleteViewChildrenFlatOperations({
      viewId,
      flatApplication: workspaceCustomFlatApplication,
      flatFieldMetadataMaps,
      flatViewMaps: flatViewMapsForChildren,
      flatViewFieldMaps,
      flatViewFilterMaps,
      flatViewSortMaps,
      flatViewFieldGroupMaps,
      flatViewFilterGroupMaps,
      fields,
      filters,
      sorts,
    });

    const allFlatEntityOperationByMetadataName: ViewUpsertFlatEntityOperations =
      {
        ...(isDefined(rootOperations.view)
          ? { view: rootOperations.view }
          : {}),
        ...(isDefined(rootOperations.viewGroup)
          ? { viewGroup: rootOperations.viewGroup }
          : {}),
        ...(isDefined(childrenOperations.viewField)
          ? { viewField: childrenOperations.viewField }
          : {}),
        ...(isDefined(childrenOperations.viewFilter)
          ? { viewFilter: childrenOperations.viewFilter }
          : {}),
        ...(isDefined(childrenOperations.viewSort)
          ? { viewSort: childrenOperations.viewSort }
          : {}),
      };

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName,
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while upserting complete view',
      );
    }

    const view = await this.viewService.findByIdWithRelations(
      viewId,
      workspaceId,
    );

    if (!isDefined(view)) {
      throw new ViewException(
        t`View not found after upsert`,
        ViewExceptionCode.VIEW_NOT_FOUND,
      );
    }

    return view;
  }

  private buildCreateViewRootOperationsOrThrow({
    objectMetadataId,
    name,
    icon,
    type,
    visibility,
    mainGroupByFieldMetadataId,
    kanbanAggregateOperation,
    kanbanAggregateOperationFieldMetadataId,
    calendarLayout,
    calendarFieldMetadataId,
    calendarEndFieldMetadataId,
    userWorkspaceId,
    flatApplication,
    flatFieldMetadataMaps,
    flatObjectMetadataMaps,
  }: {
    objectMetadataId?: string;
    name?: string;
    icon?: string;
    type?: ViewType;
    visibility?: ViewVisibility;
    mainGroupByFieldMetadataId?: string;
    kanbanAggregateOperation?: AggregateOperations;
    kanbanAggregateOperationFieldMetadataId?: string;
    calendarLayout?: ViewCalendarLayout;
    calendarFieldMetadataId?: string;
    calendarEndFieldMetadataId?: string;
    userWorkspaceId?: string;
    flatApplication: FlatApplication;
    flatFieldMetadataMaps: AllFlatEntityMaps['flatFieldMetadataMaps'];
    flatObjectMetadataMaps: AllFlatEntityMaps['flatObjectMetadataMaps'];
  }): ViewUpsertRootOperations {
    if (!isDefined(objectMetadataId)) {
      throw new ViewException(
        t`ObjectMetadataId is required when creating a view`,
        ViewExceptionCode.INVALID_VIEW_DATA,
      );
    }

    const { flatViewToCreate, flatViewGroupsToCreate } =
      fromCreateViewInputToFlatViewToCreate({
        createViewInput: {
          name: name ?? 'Untitled view',
          objectMetadataId,
          icon: icon ?? 'IconList',
          type: type ?? ViewType.TABLE,
          visibility: visibility ?? ViewVisibility.WORKSPACE,
          mainGroupByFieldMetadataId,
          kanbanAggregateOperation,
          kanbanAggregateOperationFieldMetadataId,
          calendarLayout,
          calendarFieldMetadataId,
          calendarEndFieldMetadataId,
        },
        createdByUserWorkspaceId: userWorkspaceId,
        flatApplication,
        flatFieldMetadataMaps,
        flatObjectMetadataMaps,
      });

    return {
      viewId: flatViewToCreate.id,
      viewUniversalIdentifier: flatViewToCreate.universalIdentifier,
      view: {
        flatEntityToCreate: [flatViewToCreate],
        flatEntityToDelete: [],
        flatEntityToUpdate: [],
      },
      ...(flatViewGroupsToCreate.length > 0
        ? {
            viewGroup: {
              flatEntityToCreate: flatViewGroupsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          }
        : {}),
    };
  }

  private buildUpdateViewRootOperationsOrThrow({
    existingViewId,
    name,
    icon,
    calendarEndFieldMetadataId,
    userWorkspaceId,
    applicationUniversalIdentifier,
    flatViewMaps,
    flatViewGroupMaps,
    flatFieldMetadataMaps,
  }: {
    existingViewId: string;
    name?: string;
    icon?: string;
    calendarEndFieldMetadataId?: string;
    userWorkspaceId?: string;
    applicationUniversalIdentifier: string;
    flatViewMaps: AllFlatEntityMaps['flatViewMaps'];
    flatViewGroupMaps: AllFlatEntityMaps['flatViewGroupMaps'];
    flatFieldMetadataMaps: AllFlatEntityMaps['flatFieldMetadataMaps'];
  }): ViewUpsertRootOperations {
    if (
      !isDefined(name) &&
      !isDefined(icon) &&
      !isDefined(calendarEndFieldMetadataId)
    ) {
      return { viewId: existingViewId };
    }

    const { flatViewToUpdate, flatViewGroupsToDelete, flatViewGroupsToCreate } =
      fromUpdateViewInputToFlatViewToUpdateOrThrow({
        updateViewInput: {
          id: existingViewId,
          name,
          icon,
          calendarEndFieldMetadataId,
        },
        flatViewMaps,
        flatViewGroupMaps,
        flatFieldMetadataMaps,
        userWorkspaceId,
        callerApplicationUniversalIdentifier: applicationUniversalIdentifier,
        workspaceCustomApplicationUniversalIdentifier:
          applicationUniversalIdentifier,
      });

    return {
      viewId: existingViewId,
      view: {
        flatEntityToCreate: [],
        flatEntityToDelete: [],
        flatEntityToUpdate: [flatViewToUpdate],
      },
      ...(flatViewGroupsToCreate.length > 0 || flatViewGroupsToDelete.length > 0
        ? {
            viewGroup: {
              flatEntityToCreate: flatViewGroupsToCreate,
              flatEntityToDelete: flatViewGroupsToDelete,
              flatEntityToUpdate: [],
            },
          }
        : {}),
    };
  }
}
