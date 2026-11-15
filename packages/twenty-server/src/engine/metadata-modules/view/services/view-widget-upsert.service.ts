import { Injectable } from '@nestjs/common';

import { t } from '@lingui/core/macro';
import { ViewType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IsNull } from 'typeorm';
import { v4 } from 'uuid';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { resolveEffectiveFlatEntity } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity.util';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatPageLayoutWidgetConfigurationOfType } from 'src/engine/metadata-modules/flat-page-layout-widget/utils/is-flat-page-layout-widget-configuration-of-type.util';
import { FieldDisplayMode } from 'src/engine/metadata-modules/page-layout-widget/enums/field-display-mode.enum';
import { DEFAULT_VIEW_FIELD_SIZE } from 'src/engine/metadata-modules/flat-view-field/constants/default-view-field-size.constant';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { fromViewFieldOverridesToUniversalOverrides } from 'src/engine/metadata-modules/flat-view-field/utils/from-view-field-overrides-to-universal-overrides.util';
import { type FlatViewMaps } from 'src/engine/metadata-modules/flat-view/types/flat-view-maps.type';
import { buildViewFiltersAndSortsUpsertFlatOperations } from 'src/engine/metadata-modules/flat-view/utils/build-view-filters-and-sorts-upsert-flat-operations.util';
import { fromUpdateViewInputToFlatViewToUpdateOrThrow } from 'src/engine/metadata-modules/flat-view/utils/from-update-view-input-to-flat-view-to-update-or-throw.util';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { isCallerOverridingEntity } from 'src/engine/metadata-modules/overrides/utils/is-caller-overriding-entity.util';
import { sanitizeOverridableEntityInput } from 'src/engine/metadata-modules/overrides/utils/sanitize-overridable-entity-input.util';
import { type UpsertViewWidgetViewFieldInput } from 'src/engine/metadata-modules/view/dtos/inputs/upsert-view-widget-view-field.input';
import { type UpsertViewWidgetInput } from 'src/engine/metadata-modules/view/dtos/inputs/upsert-view-widget.input';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import {
  ViewException,
  ViewExceptionCode,
} from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { resolveEffectiveFlatEntityProperty } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity-property.util';

const EMPTY_FIELD_OPS = {
  fieldsToCreate: [] as FlatViewField[],
  fieldsToUpdate: [] as FlatViewField[],
};

const ALLOWED_WIDGET_VIEW_TYPES: ViewType[] = [
  ViewType.TABLE_WIDGET,
  ViewType.KANBAN_WIDGET,
  ViewType.LIST_WIDGET,
  ViewType.CALENDAR_WIDGET,
];

@Injectable()
export class ViewWidgetUpsertService {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
    @InjectWorkspaceScopedRepository(ViewEntity)
    private readonly viewRepository: WorkspaceScopedRepository<ViewEntity>,
  ) {}

  async upsertViewWidget({
    input,
    workspaceId,
  }: {
    input: UpsertViewWidgetInput;
    workspaceId: string;
  }): Promise<ViewEntity> {
    const { widgetId } = input;

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const {
      flatPageLayoutWidgetMaps,
      flatFieldMetadataMaps,
      flatFieldMetadataOptionMaps,
      flatViewFieldMaps,
      flatViewFilterMaps,
      flatViewFilterGroupMaps,
      flatViewSortMaps,
      flatViewMaps,
      flatViewGroupMaps,
    } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: [
            'flatPageLayoutWidgetMaps',
            'flatFieldMetadataMaps',
            'flatFieldMetadataOptionMaps',
            'flatViewFieldMaps',
            'flatViewFilterMaps',
            'flatViewFilterGroupMaps',
            'flatViewSortMaps',
            'flatViewMaps',
            'flatViewGroupMaps',
          ],
        },
      );

    const widget = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: widgetId,
      flatEntityMaps: flatPageLayoutWidgetMaps,
    });

    if (!isDefined(widget)) {
      throw new ViewException(
        t`Record table widget not found`,
        ViewExceptionCode.VIEW_WIDGET_NOT_FOUND,
      );
    }

    const isRecordTableWidget = isFlatPageLayoutWidgetConfigurationOfType(
      widget,
      WidgetConfigurationType.RECORD_TABLE,
    );

    const isFieldTableWidget =
      isFlatPageLayoutWidgetConfigurationOfType(
        widget,
        WidgetConfigurationType.FIELD,
      ) && widget.configuration.fieldDisplayMode === FieldDisplayMode.TABLE;

    if (!isRecordTableWidget && !isFieldTableWidget) {
      throw new ViewException(
        t`Record table widget not found`,
        ViewExceptionCode.VIEW_WIDGET_NOT_FOUND,
      );
    }

    const viewId =
      'viewId' in widget.configuration
        ? widget.configuration.viewId
        : undefined;

    if (!isDefined(viewId)) {
      throw new ViewException(
        t`Record table widget has no associated view`,
        ViewExceptionCode.VIEW_WIDGET_NOT_FOUND,
      );
    }

    const flatView = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: viewId,
      flatEntityMaps: flatViewMaps,
    });

    if (!isDefined(flatView)) {
      throw new ViewException(
        t`View not found for widget`,
        ViewExceptionCode.VIEW_NOT_FOUND,
      );
    }

    const upsertContext = {
      viewId,
      workspaceId,
      applicationId: workspaceCustomFlatApplication.id,
      applicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
      now: new Date().toISOString(),
    };

    if (isDefined(input.view)) {
      if (
        isDefined(input.view.type) &&
        !ALLOWED_WIDGET_VIEW_TYPES.includes(input.view.type)
      ) {
        throw new ViewException(
          t`Widget views must use a widget view type`,
          ViewExceptionCode.INVALID_VIEW_DATA,
        );
      }
    }

    if (
      !isDefined(input.viewFields) &&
      !isDefined(input.viewFilterGroups) &&
      !isDefined(input.viewFilters) &&
      !isDefined(input.viewSorts) &&
      !isDefined(input.view)
    ) {
      const view = await this.viewRepository.findOne(
        upsertContext.workspaceId,
        {
          where: {
            id: upsertContext.viewId,
            deletedAt: IsNull(),
          },
        },
      );

      if (!isDefined(view)) {
        throw new ViewException(
          t`View not found`,
          ViewExceptionCode.VIEW_NOT_FOUND,
        );
      }

      return view;
    }

    const existingViewFields = Object.values(
      flatViewFieldMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (field) =>
          resolveEffectiveFlatEntityProperty({
            metadataName: 'viewField',
            flatEntity: field,
            property: 'isActive',
          }) && field.viewId === viewId,
      );

    const viewFieldOperations = isDefined(input.viewFields)
      ? this.computeViewFieldOperations({
          inputFields: input.viewFields,
          existingViewFields,
          ...upsertContext,
          flatFieldMetadataMaps,
          flatViewMaps,
        })
      : EMPTY_FIELD_OPS;

    const viewFiltersAndSortsOperations =
      buildViewFiltersAndSortsUpsertFlatOperations({
        ...upsertContext,
        viewFilterGroups: input.viewFilterGroups,
        viewFilters: input.viewFilters,
        viewSorts: input.viewSorts,
        flatFieldMetadataMaps,
        flatViewMaps,
        flatViewFilterMaps,
        flatViewFilterGroupMaps,
        flatViewSortMaps,
      });

    const viewUpdateOperations = isDefined(input.view)
      ? fromUpdateViewInputToFlatViewToUpdateOrThrow({
          updateViewInput: {
            id: viewId,
            ...input.view,
          },
          flatViewMaps,
          flatViewGroupMaps,
          flatFieldMetadataMaps,
          flatFieldMetadataOptionMaps,
          callerApplicationUniversalIdentifier:
            upsertContext.applicationUniversalIdentifier,
          workspaceCustomApplicationUniversalIdentifier:
            upsertContext.applicationUniversalIdentifier,
        })
      : undefined;

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            view: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: isDefined(viewUpdateOperations)
                ? [viewUpdateOperations.flatViewToUpdate]
                : [],
            },
            viewGroup: {
              flatEntityToCreate: isDefined(viewUpdateOperations)
                ? viewUpdateOperations.flatViewGroupsToCreate
                : [],
              flatEntityToDelete: isDefined(viewUpdateOperations)
                ? viewUpdateOperations.flatViewGroupsToDelete
                : [],
              flatEntityToUpdate: [],
            },
            viewField: {
              flatEntityToCreate: viewFieldOperations.fieldsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: viewFieldOperations.fieldsToUpdate,
            },
            ...viewFiltersAndSortsOperations,
          },
          workspaceId: upsertContext.workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier:
            upsertContext.applicationUniversalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while upserting view widget',
      );
    }

    const view = await this.viewRepository.findOne(upsertContext.workspaceId, {
      where: {
        id: upsertContext.viewId,
        deletedAt: IsNull(),
      },
    });

    if (!isDefined(view)) {
      throw new ViewException(
        t`View not found after upsert`,
        ViewExceptionCode.VIEW_NOT_FOUND,
      );
    }

    return view;
  }

  private computeViewFieldOperations({
    inputFields,
    existingViewFields,
    viewId,
    workspaceId,
    applicationId,
    applicationUniversalIdentifier,
    now,
    flatFieldMetadataMaps,
    flatViewMaps,
  }: {
    inputFields: UpsertViewWidgetViewFieldInput[];
    existingViewFields: FlatViewField[];
    viewId: string;
    workspaceId: string;
    applicationId: string;
    applicationUniversalIdentifier: string;
    now: string;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    flatViewMaps: FlatViewMaps;
  }): {
    fieldsToCreate: FlatViewField[];
    fieldsToUpdate: FlatViewField[];
  } {
    const fieldsToCreate: FlatViewField[] = [];
    const fieldsToUpdate: FlatViewField[] = [];

    for (const inputField of inputFields) {
      const existingFieldByViewFieldId = isDefined(inputField.viewFieldId)
        ? existingViewFields.find((f) => f.id === inputField.viewFieldId)
        : undefined;

      const existingFieldByFieldMetadataId = isDefined(
        inputField.fieldMetadataId,
      )
        ? existingViewFields.find(
            (f) =>
              f.isCanonical && f.fieldMetadataId === inputField.fieldMetadataId,
          )
        : undefined;

      const existingField =
        existingFieldByViewFieldId ?? existingFieldByFieldMetadataId;

      if (isDefined(existingField)) {
        const effectiveExistingField = resolveEffectiveFlatEntity({
          metadataName: 'viewField',
          flatEntity: existingField,
        });

        const hasChanged =
          effectiveExistingField.isVisible !== inputField.isVisible ||
          effectiveExistingField.position !== inputField.position ||
          (isDefined(inputField.size) &&
            effectiveExistingField.size !== inputField.size) ||
          (inputField.aggregateOperation !== undefined &&
            effectiveExistingField.aggregateOperation !==
              inputField.aggregateOperation);

        if (!hasChanged) {
          continue;
        }

        const shouldOverride = isCallerOverridingEntity({
          callerApplicationUniversalIdentifier: applicationUniversalIdentifier,
          entityApplicationUniversalIdentifier:
            existingField.applicationUniversalIdentifier,
          workspaceCustomApplicationUniversalIdentifier:
            applicationUniversalIdentifier,
          isSystemSideEffect: existingField.isSystemSideEffect,
        });

        const { overrides, updatedEditableProperties: sanitizedFieldProps } =
          sanitizeOverridableEntityInput({
            metadataName: 'viewField',
            existingFlatEntity: existingField,
            updatedEditableProperties: {
              isVisible: inputField.isVisible,
              position: inputField.position,
              ...(isDefined(inputField.size) ? { size: inputField.size } : {}),
              ...(inputField.aggregateOperation !== undefined
                ? { aggregateOperation: inputField.aggregateOperation }
                : {}),
            },
            shouldOverride,
            callerApplicationUniversalIdentifier:
              applicationUniversalIdentifier,
            workspaceCustomApplicationUniversalIdentifier:
              applicationUniversalIdentifier,
          });

        const updatedField: FlatViewField = {
          ...existingField,
          ...sanitizedFieldProps,
          overrides,
          updatedAt: now,
        };

        if (isDefined(overrides)) {
          updatedField.universalOverrides =
            fromViewFieldOverridesToUniversalOverrides({
              overrides,
              viewFieldGroupUniversalIdentifierById: {},
            });
        } else {
          updatedField.universalOverrides = null;
        }

        fieldsToUpdate.push(updatedField);
        continue;
      }

      if (!isDefined(inputField.fieldMetadataId)) {
        continue;
      }

      const fieldMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: inputField.fieldMetadataId,
        flatEntityMaps: flatFieldMetadataMaps,
      });

      if (!isDefined(fieldMetadata)) {
        continue;
      }

      const { fieldMetadataUniversalIdentifier, viewUniversalIdentifier } =
        resolveEntityRelationUniversalIdentifiers({
          metadataName: 'viewField',
          foreignKeyValues: {
            fieldMetadataId: inputField.fieldMetadataId,
            viewId,
          },
          flatEntityMaps: {
            flatFieldMetadataMaps,
            flatViewMaps,
          },
        });

      fieldsToCreate.push({
        id: v4(),
        workspaceId,
        applicationId,
        universalIdentifier: v4(),
        applicationUniversalIdentifier,
        fieldMetadataId: inputField.fieldMetadataId,
        fieldMetadataUniversalIdentifier,
        viewId,
        viewUniversalIdentifier,
        viewFieldGroupId: null,
        viewFieldGroupUniversalIdentifier: null,
        isVisible: inputField.isVisible,
        size: inputField.size ?? DEFAULT_VIEW_FIELD_SIZE,
        position: inputField.position,
        aggregateOperation: inputField.aggregateOperation ?? null,
        settings: null,
        overrides: null,
        universalOverrides: null,
        isActive: true,
        isSystemSideEffect: false,
        isCanonical: true,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      });
    }

    return { fieldsToCreate, fieldsToUpdate };
  }
}
