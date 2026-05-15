import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { t } from '@lingui/core/macro';
import {
  ViewFilterGroupLogicalOperator,
  ViewFilterOperand,
  ViewSortDirection,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';
import { v4 } from 'uuid';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { splitEntitiesByRemovalStrategy } from 'src/engine/metadata-modules/flat-entity/utils/split-entities-by-removal-strategy.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatPageLayoutWidgetConfigurationOfType } from 'src/engine/metadata-modules/flat-page-layout-widget/utils/is-flat-page-layout-widget-configuration-of-type.util';
import { DEFAULT_VIEW_FIELD_SIZE } from 'src/engine/metadata-modules/flat-view-field/constants/default-view-field-size.constant';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { fromViewFieldOverridesToUniversalOverrides } from 'src/engine/metadata-modules/flat-view-field/utils/from-view-field-overrides-to-universal-overrides.util';
import { type FlatViewFilterGroupMaps } from 'src/engine/metadata-modules/flat-view-filter-group/types/flat-view-filter-group-maps.type';
import { type FlatViewFilterGroup } from 'src/engine/metadata-modules/flat-view-filter-group/types/flat-view-filter-group.type';
import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';
import { type FlatViewSort } from 'src/engine/metadata-modules/flat-view-sort/types/flat-view-sort.type';
import { type FlatViewMaps } from 'src/engine/metadata-modules/flat-view/types/flat-view-maps.type';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { isCallerOverridingEntity } from 'src/engine/metadata-modules/utils/is-caller-overriding-entity.util';
import { sanitizeOverridableEntityInput } from 'src/engine/metadata-modules/utils/sanitize-overridable-entity-input.util';
import { type UpsertViewWidgetViewFieldInput } from 'src/engine/metadata-modules/view/dtos/inputs/upsert-view-widget-view-field.input';
import { type UpsertViewWidgetViewFilterGroupInput } from 'src/engine/metadata-modules/view/dtos/inputs/upsert-view-widget-view-filter-group.input';
import { type UpsertViewWidgetViewFilterInput } from 'src/engine/metadata-modules/view/dtos/inputs/upsert-view-widget-view-filter.input';
import { type UpsertViewWidgetViewSortInput } from 'src/engine/metadata-modules/view/dtos/inputs/upsert-view-widget-view-sort.input';
import { type UpsertViewWidgetInput } from 'src/engine/metadata-modules/view/dtos/inputs/upsert-view-widget.input';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import {
  ViewException,
  ViewExceptionCode,
} from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const EMPTY_FIELD_OPS = {
  fieldsToCreate: [] as FlatViewField[],
  fieldsToUpdate: [] as FlatViewField[],
};

const EMPTY_FILTER_GROUP_OPS = {
  filterGroupsToCreate: [] as FlatViewFilterGroup[],
  filterGroupsToUpdate: [] as FlatViewFilterGroup[],
  filterGroupsToRemove: [] as FlatViewFilterGroup[],
};

const EMPTY_FILTER_OPS = {
  filtersToCreate: [] as FlatViewFilter[],
  filtersToUpdate: [] as FlatViewFilter[],
  filtersToRemove: [] as FlatViewFilter[],
};

const EMPTY_SORT_OPS = {
  sortsToCreate: [] as FlatViewSort[],
  sortsToUpdate: [] as FlatViewSort[],
  sortsToRemove: [] as FlatViewSort[],
};

@Injectable()
export class ViewWidgetUpsertService {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
    @InjectRepository(ViewEntity)
    private readonly viewRepository: Repository<ViewEntity>,
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
      flatViewFieldMaps,
      flatViewFilterMaps,
      flatViewFilterGroupMaps,
      flatViewSortMaps,
      flatViewMaps,
    } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: [
            'flatPageLayoutWidgetMaps',
            'flatFieldMetadataMaps',
            'flatViewFieldMaps',
            'flatViewFilterMaps',
            'flatViewFilterGroupMaps',
            'flatViewSortMaps',
            'flatViewMaps',
          ],
        },
      );

    const widget = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: widgetId,
      flatEntityMaps: flatPageLayoutWidgetMaps,
    });

    if (
      !isDefined(widget) ||
      !isFlatPageLayoutWidgetConfigurationOfType(
        widget,
        WidgetConfigurationType.RECORD_TABLE,
      )
    ) {
      throw new ViewException(
        t`Record table widget not found`,
        ViewExceptionCode.VIEW_WIDGET_NOT_FOUND,
      );
    }

    const viewId = widget.configuration.viewId;

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

    if (
      !isDefined(input.viewFields) &&
      !isDefined(input.viewFilterGroups) &&
      !isDefined(input.viewFilters) &&
      !isDefined(input.viewSorts)
    ) {
      const view = await this.viewRepository.findOne({
        where: {
          id: upsertContext.viewId,
          workspaceId: upsertContext.workspaceId,
          deletedAt: IsNull(),
        },
      });

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
      .filter((field) => field.isActive && field.viewId === viewId);

    const existingViewFilters = Object.values(
      flatViewFilterMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((filter) => filter.viewId === viewId);

    const existingViewFilterGroups = Object.values(
      flatViewFilterGroupMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((group) => group.viewId === viewId);

    const existingViewSorts = Object.values(
      flatViewSortMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((sort) => sort.viewId === viewId);

    const viewFieldOperations = isDefined(input.viewFields)
      ? this.computeViewFieldOperations({
          inputFields: input.viewFields,
          existingViewFields,
          ...upsertContext,
          flatFieldMetadataMaps,
          flatViewMaps,
        })
      : EMPTY_FIELD_OPS;

    const viewFilterGroupOperations = isDefined(input.viewFilterGroups)
      ? this.computeViewFilterGroupOperations({
          inputFilterGroups: input.viewFilterGroups,
          existingViewFilterGroups,
          ...upsertContext,
          flatViewMaps,
          flatViewFilterGroupMaps,
        })
      : EMPTY_FILTER_GROUP_OPS;

    const optimisticFilterGroupMaps =
      viewFilterGroupOperations.filterGroupsToCreate.reduce(
        (maps, group) =>
          addFlatEntityToFlatEntityMapsOrThrow({
            flatEntity: group,
            flatEntityMaps: maps,
          }),
        flatViewFilterGroupMaps,
      );

    const viewFilterOperations = isDefined(input.viewFilters)
      ? this.computeViewFilterOperations({
          inputFilters: input.viewFilters,
          existingViewFilters,
          ...upsertContext,
          flatFieldMetadataMaps,
          flatViewMaps,
          flatViewFilterGroupMaps: optimisticFilterGroupMaps,
        })
      : EMPTY_FILTER_OPS;

    const viewSortOperations = isDefined(input.viewSorts)
      ? this.computeViewSortOperations({
          inputSorts: input.viewSorts,
          existingViewSorts,
          ...upsertContext,
          flatFieldMetadataMaps,
          flatViewMaps,
        })
      : EMPTY_SORT_OPS;

    const {
      toHardDelete: filterGroupsToDelete,
      toDeactivate: filterGroupsToDeactivate,
    } = splitEntitiesByRemovalStrategy({
      entitiesToRemove: viewFilterGroupOperations.filterGroupsToRemove,
      workspaceCustomApplicationUniversalIdentifier:
        upsertContext.applicationUniversalIdentifier,
      now: upsertContext.now,
    });

    const { toHardDelete: filtersToDelete, toDeactivate: filtersToDeactivate } =
      splitEntitiesByRemovalStrategy({
        entitiesToRemove: viewFilterOperations.filtersToRemove,
        workspaceCustomApplicationUniversalIdentifier:
          upsertContext.applicationUniversalIdentifier,
        now: upsertContext.now,
      });

    const { toHardDelete: sortsToDelete, toDeactivate: sortsToDeactivate } =
      splitEntitiesByRemovalStrategy({
        entitiesToRemove: viewSortOperations.sortsToRemove,
        workspaceCustomApplicationUniversalIdentifier:
          upsertContext.applicationUniversalIdentifier,
        now: upsertContext.now,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            viewField: {
              flatEntityToCreate: viewFieldOperations.fieldsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: viewFieldOperations.fieldsToUpdate,
            },
            viewFilterGroup: {
              flatEntityToCreate:
                viewFilterGroupOperations.filterGroupsToCreate,
              flatEntityToDelete: filterGroupsToDelete,
              flatEntityToUpdate: [
                ...viewFilterGroupOperations.filterGroupsToUpdate,
                ...filterGroupsToDeactivate,
              ],
            },
            viewFilter: {
              flatEntityToCreate: viewFilterOperations.filtersToCreate,
              flatEntityToDelete: filtersToDelete,
              flatEntityToUpdate: [
                ...viewFilterOperations.filtersToUpdate,
                ...filtersToDeactivate,
              ],
            },
            viewSort: {
              flatEntityToCreate: viewSortOperations.sortsToCreate,
              flatEntityToDelete: sortsToDelete,
              flatEntityToUpdate: [
                ...viewSortOperations.sortsToUpdate,
                ...sortsToDeactivate,
              ],
            },
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

    const view = await this.viewRepository.findOne({
      where: {
        id: upsertContext.viewId,
        workspaceId: upsertContext.workspaceId,
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
            (f) => f.fieldMetadataId === inputField.fieldMetadataId,
          )
        : undefined;

      const existingField =
        existingFieldByViewFieldId ?? existingFieldByFieldMetadataId;

      if (isDefined(existingField)) {
        const resolvedIsVisible = isDefined(existingField.overrides?.isVisible)
          ? existingField.overrides.isVisible
          : existingField.isVisible;
        const resolvedPosition = isDefined(existingField.overrides?.position)
          ? existingField.overrides.position
          : existingField.position;
        const resolvedSize = isDefined(existingField.overrides?.size)
          ? existingField.overrides.size
          : existingField.size;

        const hasChanged =
          resolvedIsVisible !== inputField.isVisible ||
          resolvedPosition !== inputField.position ||
          (isDefined(inputField.size) && resolvedSize !== inputField.size);

        if (!hasChanged) {
          continue;
        }

        const shouldOverride = isCallerOverridingEntity({
          callerApplicationUniversalIdentifier: applicationUniversalIdentifier,
          entityApplicationUniversalIdentifier:
            existingField.applicationUniversalIdentifier,
          workspaceCustomApplicationUniversalIdentifier:
            applicationUniversalIdentifier,
        });

        const { overrides, updatedEditableProperties: sanitizedFieldProps } =
          sanitizeOverridableEntityInput({
            metadataName: 'viewField',
            existingFlatEntity: existingField,
            updatedEditableProperties: {
              isVisible: inputField.isVisible,
              position: inputField.position,
              ...(isDefined(inputField.size) ? { size: inputField.size } : {}),
            },
            shouldOverride,
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
        aggregateOperation: null,
        overrides: null,
        universalOverrides: null,
        isActive: true,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      });
    }

    return { fieldsToCreate, fieldsToUpdate };
  }

  private computeViewFilterGroupOperations({
    inputFilterGroups,
    existingViewFilterGroups,
    viewId,
    workspaceId,
    applicationId,
    applicationUniversalIdentifier,
    now,
    flatViewMaps,
    flatViewFilterGroupMaps,
  }: {
    inputFilterGroups: UpsertViewWidgetViewFilterGroupInput[];
    existingViewFilterGroups: FlatViewFilterGroup[];
    viewId: string;
    workspaceId: string;
    applicationId: string;
    applicationUniversalIdentifier: string;
    now: string;
    flatViewMaps: FlatViewMaps;
    flatViewFilterGroupMaps: FlatViewFilterGroupMaps;
  }): {
    filterGroupsToCreate: FlatViewFilterGroup[];
    filterGroupsToUpdate: FlatViewFilterGroup[];
    filterGroupsToRemove: FlatViewFilterGroup[];
  } {
    const filterGroupsToCreate: FlatViewFilterGroup[] = [];
    const filterGroupsToUpdate: FlatViewFilterGroup[] = [];
    const inputFilterGroupIds = new Set(
      inputFilterGroups.map((g) => g.id).filter(isDefined),
    );

    for (const inputGroup of inputFilterGroups) {
      const existingGroup = isDefined(inputGroup.id)
        ? existingViewFilterGroups.find((g) => g.id === inputGroup.id)
        : undefined;

      if (!isDefined(existingGroup)) {
        const filterGroupId = inputGroup.id ?? v4();

        const {
          viewUniversalIdentifier,
          parentViewFilterGroupUniversalIdentifier,
        } = resolveEntityRelationUniversalIdentifiers({
          metadataName: 'viewFilterGroup',
          foreignKeyValues: {
            viewId,
            parentViewFilterGroupId: inputGroup.parentViewFilterGroupId,
          },
          flatEntityMaps: { flatViewMaps, flatViewFilterGroupMaps },
        });

        filterGroupsToCreate.push({
          id: filterGroupId,
          workspaceId,
          applicationId,
          universalIdentifier: filterGroupId,
          applicationUniversalIdentifier,
          viewId,
          viewUniversalIdentifier,
          logicalOperator:
            inputGroup.logicalOperator ?? ViewFilterGroupLogicalOperator.AND,
          parentViewFilterGroupId: inputGroup.parentViewFilterGroupId ?? null,
          parentViewFilterGroupUniversalIdentifier,
          positionInViewFilterGroup:
            inputGroup.positionInViewFilterGroup ?? null,
          viewFilterIds: [],
          viewFilterUniversalIdentifiers: [],
          childViewFilterGroupIds: [],
          childViewFilterGroupUniversalIdentifiers: [],
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
        });
      } else {
        const hasChanged =
          existingGroup.logicalOperator !== inputGroup.logicalOperator ||
          existingGroup.positionInViewFilterGroup !==
            inputGroup.positionInViewFilterGroup ||
          existingGroup.parentViewFilterGroupId !==
            inputGroup.parentViewFilterGroupId;

        if (hasChanged) {
          const resolvedParentId =
            inputGroup.parentViewFilterGroupId ??
            existingGroup.parentViewFilterGroupId;

          const { parentViewFilterGroupUniversalIdentifier } =
            resolveEntityRelationUniversalIdentifiers({
              metadataName: 'viewFilterGroup',
              foreignKeyValues: {
                parentViewFilterGroupId: resolvedParentId,
              },
              flatEntityMaps: { flatViewFilterGroupMaps },
            });

          filterGroupsToUpdate.push({
            ...existingGroup,
            logicalOperator:
              inputGroup.logicalOperator ?? existingGroup.logicalOperator,
            positionInViewFilterGroup:
              inputGroup.positionInViewFilterGroup ??
              existingGroup.positionInViewFilterGroup,
            parentViewFilterGroupId: resolvedParentId,
            parentViewFilterGroupUniversalIdentifier,
            updatedAt: now,
          });
        }
      }
    }

    const filterGroupsToRemove = existingViewFilterGroups.filter(
      (g) => !inputFilterGroupIds.has(g.id),
    );

    return { filterGroupsToCreate, filterGroupsToUpdate, filterGroupsToRemove };
  }

  private computeViewFilterOperations({
    inputFilters,
    existingViewFilters,
    viewId,
    workspaceId,
    applicationId,
    applicationUniversalIdentifier,
    now,
    flatFieldMetadataMaps,
    flatViewMaps,
    flatViewFilterGroupMaps,
  }: {
    inputFilters: UpsertViewWidgetViewFilterInput[];
    existingViewFilters: FlatViewFilter[];
    viewId: string;
    workspaceId: string;
    applicationId: string;
    applicationUniversalIdentifier: string;
    now: string;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    flatViewMaps: FlatViewMaps;
    flatViewFilterGroupMaps: FlatViewFilterGroupMaps;
  }): {
    filtersToCreate: FlatViewFilter[];
    filtersToUpdate: FlatViewFilter[];
    filtersToRemove: FlatViewFilter[];
  } {
    const filtersToCreate: FlatViewFilter[] = [];
    const filtersToUpdate: FlatViewFilter[] = [];
    const inputFilterIds = new Set(
      inputFilters.map((f) => f.id).filter(isDefined),
    );

    for (const inputFilter of inputFilters) {
      const existingFilter = isDefined(inputFilter.id)
        ? existingViewFilters.find((f) => f.id === inputFilter.id)
        : undefined;

      if (!isDefined(existingFilter)) {
        const filterId = inputFilter.id ?? v4();

        const {
          fieldMetadataUniversalIdentifier,
          viewUniversalIdentifier,
          viewFilterGroupUniversalIdentifier,
          relationTargetFieldMetadataUniversalIdentifier,
        } = resolveEntityRelationUniversalIdentifiers({
          metadataName: 'viewFilter',
          foreignKeyValues: {
            fieldMetadataId: inputFilter.fieldMetadataId,
            viewId,
            viewFilterGroupId: inputFilter.viewFilterGroupId,
            relationTargetFieldMetadataId:
              inputFilter.relationTargetFieldMetadataId,
          },
          flatEntityMaps: {
            flatFieldMetadataMaps,
            flatViewMaps,
            flatViewFilterGroupMaps,
          },
        });

        filtersToCreate.push({
          id: filterId,
          workspaceId,
          applicationId,
          universalIdentifier: v4(),
          applicationUniversalIdentifier,
          fieldMetadataId: inputFilter.fieldMetadataId,
          fieldMetadataUniversalIdentifier,
          viewId,
          viewUniversalIdentifier,
          operand: inputFilter.operand ?? ViewFilterOperand.CONTAINS,
          value: inputFilter.value,
          viewFilterGroupId: inputFilter.viewFilterGroupId ?? null,
          viewFilterGroupUniversalIdentifier,
          positionInViewFilterGroup:
            inputFilter.positionInViewFilterGroup ?? null,
          subFieldName: inputFilter.subFieldName ?? null,
          relationTargetFieldMetadataId:
            inputFilter.relationTargetFieldMetadataId ?? null,
          relationTargetFieldMetadataUniversalIdentifier,
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
        });
      } else {
        const hasChanged =
          existingFilter.fieldMetadataId !== inputFilter.fieldMetadataId ||
          existingFilter.operand !== inputFilter.operand ||
          JSON.stringify(existingFilter.value) !==
            JSON.stringify(inputFilter.value) ||
          existingFilter.viewFilterGroupId !== inputFilter.viewFilterGroupId ||
          existingFilter.positionInViewFilterGroup !==
            inputFilter.positionInViewFilterGroup ||
          existingFilter.subFieldName !== inputFilter.subFieldName ||
          existingFilter.relationTargetFieldMetadataId !==
            (inputFilter.relationTargetFieldMetadataId ?? null);

        if (hasChanged) {
          const {
            fieldMetadataUniversalIdentifier,
            viewFilterGroupUniversalIdentifier,
            relationTargetFieldMetadataUniversalIdentifier,
          } = resolveEntityRelationUniversalIdentifiers({
            metadataName: 'viewFilter',
            foreignKeyValues: {
              fieldMetadataId: inputFilter.fieldMetadataId,
              viewFilterGroupId: inputFilter.viewFilterGroupId,
              relationTargetFieldMetadataId:
                inputFilter.relationTargetFieldMetadataId,
            },
            flatEntityMaps: {
              flatFieldMetadataMaps,
              flatViewFilterGroupMaps,
            },
          });

          filtersToUpdate.push({
            ...existingFilter,
            fieldMetadataId: inputFilter.fieldMetadataId,
            fieldMetadataUniversalIdentifier,
            operand: inputFilter.operand ?? existingFilter.operand,
            value: inputFilter.value,
            viewFilterGroupId:
              inputFilter.viewFilterGroupId ?? existingFilter.viewFilterGroupId,
            viewFilterGroupUniversalIdentifier,
            positionInViewFilterGroup:
              inputFilter.positionInViewFilterGroup ??
              existingFilter.positionInViewFilterGroup,
            subFieldName:
              inputFilter.subFieldName ?? existingFilter.subFieldName,
            relationTargetFieldMetadataId:
              inputFilter.relationTargetFieldMetadataId ?? null,
            relationTargetFieldMetadataUniversalIdentifier,
            updatedAt: now,
          });
        }
      }
    }

    const filtersToRemove = existingViewFilters.filter(
      (f) => !inputFilterIds.has(f.id),
    );

    return { filtersToCreate, filtersToUpdate, filtersToRemove };
  }

  private computeViewSortOperations({
    inputSorts,
    existingViewSorts,
    viewId,
    workspaceId,
    applicationId,
    applicationUniversalIdentifier,
    now,
    flatFieldMetadataMaps,
    flatViewMaps,
  }: {
    inputSorts: UpsertViewWidgetViewSortInput[];
    existingViewSorts: FlatViewSort[];
    viewId: string;
    workspaceId: string;
    applicationId: string;
    applicationUniversalIdentifier: string;
    now: string;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    flatViewMaps: FlatViewMaps;
  }): {
    sortsToCreate: FlatViewSort[];
    sortsToUpdate: FlatViewSort[];
    sortsToRemove: FlatViewSort[];
  } {
    const sortsToCreate: FlatViewSort[] = [];
    const sortsToUpdate: FlatViewSort[] = [];
    const inputSortIds = new Set(inputSorts.map((s) => s.id).filter(isDefined));

    for (const inputSort of inputSorts) {
      const existingSort = isDefined(inputSort.id)
        ? existingViewSorts.find((s) => s.id === inputSort.id)
        : undefined;

      if (!isDefined(existingSort)) {
        const sortId = inputSort.id ?? v4();

        const { fieldMetadataUniversalIdentifier, viewUniversalIdentifier } =
          resolveEntityRelationUniversalIdentifiers({
            metadataName: 'viewSort',
            foreignKeyValues: {
              fieldMetadataId: inputSort.fieldMetadataId,
              viewId,
            },
            flatEntityMaps: {
              flatFieldMetadataMaps,
              flatViewMaps,
            },
          });

        sortsToCreate.push({
          id: sortId,
          workspaceId,
          applicationId,
          universalIdentifier: v4(),
          applicationUniversalIdentifier,
          fieldMetadataId: inputSort.fieldMetadataId,
          fieldMetadataUniversalIdentifier,
          viewId,
          viewUniversalIdentifier,
          direction: inputSort.direction ?? ViewSortDirection.ASC,
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
        });
      } else {
        const hasChanged =
          existingSort.fieldMetadataId !== inputSort.fieldMetadataId ||
          existingSort.direction !== inputSort.direction;

        if (hasChanged) {
          const { fieldMetadataUniversalIdentifier } =
            resolveEntityRelationUniversalIdentifiers({
              metadataName: 'viewSort',
              foreignKeyValues: {
                fieldMetadataId: inputSort.fieldMetadataId,
              },
              flatEntityMaps: {
                flatFieldMetadataMaps,
              },
            });

          sortsToUpdate.push({
            ...existingSort,
            fieldMetadataId: inputSort.fieldMetadataId,
            fieldMetadataUniversalIdentifier,
            direction: inputSort.direction ?? existingSort.direction,
            updatedAt: now,
          });
        }
      }
    }

    const sortsToRemove = existingViewSorts.filter(
      (s) => !inputSortIds.has(s.id),
    );

    return { sortsToCreate, sortsToUpdate, sortsToRemove };
  }
}
