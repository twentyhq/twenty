import { Injectable } from '@nestjs/common';

import { t } from '@lingui/core/macro';
import { ViewType } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatEntityToCreateDeleteUpdate } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-to-create-delete-update.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { splitEntitiesByRemovalStrategy } from 'src/engine/metadata-modules/flat-entity/utils/split-entities-by-removal-strategy.util';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { fromCreateViewFieldInputToFlatViewFieldToCreate } from 'src/engine/metadata-modules/flat-view-field/utils/from-create-view-field-input-to-flat-view-field-to-create.util';
import { fromUpdateViewFieldInputToFlatViewFieldToUpdateOrThrow } from 'src/engine/metadata-modules/flat-view-field/utils/from-update-view-field-input-to-flat-view-field-to-update-or-throw.util';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { buildViewFiltersAndSortsUpsertFlatOperations } from 'src/engine/metadata-modules/flat-view/utils/build-view-filters-and-sorts-upsert-flat-operations.util';
import { fromCreateViewInputToFlatViewToCreate } from 'src/engine/metadata-modules/flat-view/utils/from-create-view-input-to-flat-view-to-create.util';
import { inheritScopeViewOwnerVisibility } from 'src/engine/metadata-modules/flat-view/utils/inherit-scope-view-owner-visibility.util';
import { type UpsertViewFieldWithScopeInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/upsert-view-field-with-scope.input';
import { type ViewFieldScopeInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/view-field-scope.input';
import { type ViewFieldWithScopeDTO } from 'src/engine/metadata-modules/view-field/dtos/view-field-with-scope.dto';
import {
  ViewFieldException,
  ViewFieldExceptionCode,
} from 'src/engine/metadata-modules/view-field/exceptions/view-field.exception';
import { fromFlatViewFieldToViewFieldDto } from 'src/engine/metadata-modules/view-field/utils/from-flat-view-field-to-view-field-dto.util';
import { ViewService } from 'src/engine/metadata-modules/view/services/view.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

type ScopeFlatEntityOperations = {
  view: FlatEntityToCreateDeleteUpdate<'view'>;
} & Partial<ReturnType<typeof buildViewFiltersAndSortsUpsertFlatOperations>>;

type ViewFieldWithScopeFlatMaps = Pick<
  AllFlatEntityMaps,
  | 'flatFieldMetadataMaps'
  | 'flatFieldMetadataOptionMaps'
  | 'flatObjectMetadataMaps'
  | 'flatViewMaps'
  | 'flatViewFieldMaps'
  | 'flatViewFieldGroupMaps'
  | 'flatViewFilterMaps'
  | 'flatViewFilterGroupMaps'
  | 'flatViewSortMaps'
>;

@Injectable()
export class ViewFieldWithScopeUpsertService {
  constructor(
    private readonly viewService: ViewService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
  ) {}

  async upsertViewFieldWithScope({
    input,
    workspaceId,
  }: {
    input: UpsertViewFieldWithScopeInput;
    workspaceId: string;
  }): Promise<ViewFieldWithScopeDTO> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const flatMaps =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: [
            'flatFieldMetadataMaps',
            'flatFieldMetadataOptionMaps',
            'flatObjectMetadataMaps',
            'flatViewMaps',
            'flatViewFieldMaps',
            'flatViewFieldGroupMaps',
            'flatViewFilterMaps',
            'flatViewFilterGroupMaps',
            'flatViewSortMaps',
          ],
        },
      );

    const ownerFlatView = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: input.viewId,
      flatEntityMaps: flatMaps.flatViewMaps,
    });

    if (!isDefined(ownerFlatView) || isDefined(ownerFlatView.deletedAt)) {
      throw new ViewFieldException(
        t`View not found`,
        ViewFieldExceptionCode.VIEW_NOT_FOUND,
      );
    }

    const existingFlatViewField = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: input.id,
      flatEntityMaps: flatMaps.flatViewFieldMaps,
    });

    // The permission guards check the existing view field's view and the input view, so both must be the same
    if (
      isDefined(existingFlatViewField) &&
      existingFlatViewField.viewId !== input.viewId
    ) {
      throw new ViewFieldException(
        t`View field does not belong to this view`,
        ViewFieldExceptionCode.INVALID_VIEW_FIELD_DATA,
      );
    }

    const { viewFieldOperations, viewFieldUniversalIdentifier } =
      this.buildViewFieldOperations({
        input,
        existingFlatViewField,
        flatApplication: workspaceCustomFlatApplication,
        flatMaps,
      });

    const scopeOperations = this.buildScopeOperations({
      scope: input.scope,
      viewFieldId: input.id,
      viewFieldUniversalIdentifier,
      fieldMetadataId:
        existingFlatViewField?.fieldMetadataId ?? input.fieldMetadataId,
      ownerFlatView,
      flatApplication: workspaceCustomFlatApplication,
      flatMaps,
    });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            viewField: viewFieldOperations,
            ...scopeOperations.flatEntityOperations,
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
        'Multiple validation errors occurred while saving view field with scope',
      );
    }

    const { flatViewFieldMaps: recomputedFlatViewFieldMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: ['flatViewFieldMaps'] },
      );

    return {
      viewField: fromFlatViewFieldToViewFieldDto(
        findFlatEntityByIdInFlatEntityMapsOrThrow({
          flatEntityId: input.id,
          flatEntityMaps: recomputedFlatViewFieldMaps,
        }),
      ),
      scopeView: isDefined(scopeOperations.scopeViewId)
        ? await this.viewService.findByIdWithRelations(
            scopeOperations.scopeViewId,
            workspaceId,
          )
        : null,
    };
  }

  private buildViewFieldOperations({
    input,
    existingFlatViewField,
    flatApplication,
    flatMaps,
  }: {
    input: UpsertViewFieldWithScopeInput;
    existingFlatViewField: FlatViewField | undefined;
    flatApplication: FlatApplication;
    flatMaps: ViewFieldWithScopeFlatMaps;
  }): {
    viewFieldOperations: FlatEntityToCreateDeleteUpdate<'viewField'>;
    viewFieldUniversalIdentifier: string;
  } {
    const {
      id,
      viewId,
      fieldMetadataId,
      isCanonical,
      aggregateOperation,
      relationTargetFieldMetadataId,
      scope: _scope,
      ...editableProperties
    } = input;

    if (isDefined(existingFlatViewField)) {
      const flatViewFieldToUpdate =
        fromUpdateViewFieldInputToFlatViewFieldToUpdateOrThrow({
          updateViewFieldInput: {
            id,
            update: Object.fromEntries(
              Object.entries({
                ...editableProperties,
                aggregateOperation,
                relationTargetFieldMetadataId,
              }).filter(([, value]) => value !== undefined),
            ),
          },
          flatViewFieldMaps: flatMaps.flatViewFieldMaps,
          flatViewFieldGroupMaps: flatMaps.flatViewFieldGroupMaps,
          flatFieldMetadataMaps: flatMaps.flatFieldMetadataMaps,
          callerApplicationUniversalIdentifier:
            flatApplication.universalIdentifier,
          workspaceCustomApplicationUniversalIdentifier:
            flatApplication.universalIdentifier,
        });

      return {
        viewFieldOperations: {
          flatEntityToCreate: [],
          flatEntityToDelete: [],
          flatEntityToUpdate: [flatViewFieldToUpdate],
        },
        viewFieldUniversalIdentifier: existingFlatViewField.universalIdentifier,
      };
    }

    const flatViewFieldToCreate =
      fromCreateViewFieldInputToFlatViewFieldToCreate({
        createViewFieldInput: {
          ...editableProperties,
          id,
          viewId,
          fieldMetadataId,
          isCanonical,
          aggregateOperation: aggregateOperation ?? undefined,
          relationTargetFieldMetadataId:
            relationTargetFieldMetadataId ?? undefined,
        },
        flatApplication,
        flatFieldMetadataMaps: flatMaps.flatFieldMetadataMaps,
        flatViewMaps: flatMaps.flatViewMaps,
        flatViewFieldGroupMaps: flatMaps.flatViewFieldGroupMaps,
      });

    return {
      viewFieldOperations: {
        flatEntityToCreate: [flatViewFieldToCreate],
        flatEntityToDelete: [],
        flatEntityToUpdate: [],
      },
      viewFieldUniversalIdentifier: flatViewFieldToCreate.universalIdentifier,
    };
  }

  private buildScopeOperations({
    scope,
    viewFieldId,
    viewFieldUniversalIdentifier,
    fieldMetadataId,
    ownerFlatView,
    flatApplication,
    flatMaps,
  }: {
    scope: ViewFieldScopeInput | null | undefined;
    viewFieldId: string;
    viewFieldUniversalIdentifier: string;
    fieldMetadataId: string;
    ownerFlatView: FlatView;
    flatApplication: FlatApplication;
    flatMaps: ViewFieldWithScopeFlatMaps;
  }): {
    scopeViewId: string | null;
    flatEntityOperations: ScopeFlatEntityOperations;
  } {
    const now = new Date().toISOString();

    const existingScopeFlatViews = Object.values(
      flatMaps.flatViewMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (flatView) =>
          flatView.ownerViewFieldId === viewFieldId &&
          !isDefined(flatView.deletedAt),
      );

    const hasScope =
      isDefined(scope) &&
      (isNonEmptyArray(scope.viewFilters) || isNonEmptyArray(scope.viewSorts));

    if (!hasScope) {
      const { toHardDelete, toDeactivate } = splitEntitiesByRemovalStrategy({
        metadataName: 'view',
        entitiesToRemove: existingScopeFlatViews,
        workspaceCustomApplicationUniversalIdentifier:
          flatApplication.universalIdentifier,
        now,
      });

      return {
        scopeViewId: null,
        flatEntityOperations: {
          view: {
            flatEntityToCreate: [],
            flatEntityToDelete: toHardDelete,
            flatEntityToUpdate: toDeactivate,
          },
        },
      };
    }

    const [existingScopeFlatView] = existingScopeFlatViews;

    const scopeView =
      existingScopeFlatView ??
      this.buildScopeFlatViewToCreate({
        viewFieldId,
        viewFieldUniversalIdentifier,
        fieldMetadataId,
        ownerFlatView,
        flatApplication,
        flatMaps,
      });

    // Children of a scope view created by this migration resolve its universal identifier from here
    const flatViewMapsForChildren = {
      ...flatMaps.flatViewMaps,
      universalIdentifierById: {
        ...flatMaps.flatViewMaps.universalIdentifierById,
        [scopeView.id]: scopeView.universalIdentifier,
      },
    };

    return {
      scopeViewId: scopeView.id,
      flatEntityOperations: {
        view: {
          flatEntityToCreate: isDefined(existingScopeFlatView)
            ? []
            : [scopeView],
          flatEntityToDelete: [],
          flatEntityToUpdate: [],
        },
        ...buildViewFiltersAndSortsUpsertFlatOperations({
          viewId: scopeView.id,
          workspaceId: ownerFlatView.workspaceId,
          applicationId: flatApplication.id,
          applicationUniversalIdentifier: flatApplication.universalIdentifier,
          now,
          viewFilterGroups: scope.viewFilterGroups,
          viewFilters: scope.viewFilters,
          viewSorts: scope.viewSorts,
          flatFieldMetadataMaps: flatMaps.flatFieldMetadataMaps,
          flatViewMaps: flatViewMapsForChildren,
          flatViewFilterMaps: flatMaps.flatViewFilterMaps,
          flatViewFilterGroupMaps: flatMaps.flatViewFilterGroupMaps,
          flatViewSortMaps: flatMaps.flatViewSortMaps,
        }),
      },
    };
  }

  private buildScopeFlatViewToCreate({
    viewFieldId,
    viewFieldUniversalIdentifier,
    fieldMetadataId,
    ownerFlatView,
    flatApplication,
    flatMaps,
  }: {
    viewFieldId: string;
    viewFieldUniversalIdentifier: string;
    fieldMetadataId: string;
    ownerFlatView: FlatView;
    flatApplication: FlatApplication;
    flatMaps: ViewFieldWithScopeFlatMaps;
  }) {
    const relationTargetObjectMetadataId = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: fieldMetadataId,
      flatEntityMaps: flatMaps.flatFieldMetadataMaps,
    })?.relationTargetObjectMetadataId;

    if (!isDefined(relationTargetObjectMetadataId)) {
      throw new ViewFieldException(
        t`Only a view field of a one-to-many relation can be scoped`,
        ViewFieldExceptionCode.INVALID_VIEW_FIELD_DATA,
      );
    }

    // The owner view field may be created by the same migration
    const flatViewFieldMapsWithOwner = {
      ...flatMaps.flatViewFieldMaps,
      universalIdentifierById: {
        ...flatMaps.flatViewFieldMaps.universalIdentifierById,
        [viewFieldId]: viewFieldUniversalIdentifier,
      },
    };

    const { flatViewToCreate } = fromCreateViewInputToFlatViewToCreate({
      createViewInput: {
        name: 'Column scope',
        icon: 'IconFilter',
        objectMetadataId: relationTargetObjectMetadataId,
        type: ViewType.TABLE_WIDGET,
        ownerViewFieldId: viewFieldId,
      },
      flatApplication,
      flatFieldMetadataMaps: flatMaps.flatFieldMetadataMaps,
      flatFieldMetadataOptionMaps: flatMaps.flatFieldMetadataOptionMaps,
      flatObjectMetadataMaps: flatMaps.flatObjectMetadataMaps,
      flatViewFieldMaps: flatViewFieldMapsWithOwner,
    });

    return inheritScopeViewOwnerVisibility({
      flatViewToCreate,
      ownerParentFlatView: ownerFlatView,
    });
  }
}
