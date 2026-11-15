import {
  ViewFilterGroupLogicalOperator,
  ViewFilterOperand,
  ViewSortDirection,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatEntityToCreateDeleteUpdate } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-to-create-delete-update.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { splitEntitiesByRemovalStrategy } from 'src/engine/metadata-modules/flat-entity/utils/split-entities-by-removal-strategy.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatViewFilterGroupMaps } from 'src/engine/metadata-modules/flat-view-filter-group/types/flat-view-filter-group-maps.type';
import { type FlatViewFilterGroup } from 'src/engine/metadata-modules/flat-view-filter-group/types/flat-view-filter-group.type';
import { type FlatViewFilterMaps } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter-maps.type';
import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';
import { getDefaultViewFilterOperand } from 'src/engine/metadata-modules/flat-view-filter/utils/get-default-view-filter-operand.util';
import { type FlatViewSortMaps } from 'src/engine/metadata-modules/flat-view-sort/types/flat-view-sort-maps.type';
import { type FlatViewSort } from 'src/engine/metadata-modules/flat-view-sort/types/flat-view-sort.type';
import { type FlatViewMaps } from 'src/engine/metadata-modules/flat-view/types/flat-view-maps.type';
import { type UpsertViewWidgetViewFilterGroupInput } from 'src/engine/metadata-modules/view/dtos/inputs/upsert-view-widget-view-filter-group.input';
import { type UpsertViewWidgetViewFilterInput } from 'src/engine/metadata-modules/view/dtos/inputs/upsert-view-widget-view-filter.input';
import { type UpsertViewWidgetViewSortInput } from 'src/engine/metadata-modules/view/dtos/inputs/upsert-view-widget-view-sort.input';
import { sortViewFilterGroupInputsParentsFirst } from 'src/engine/metadata-modules/view/utils/sort-view-filter-group-inputs-parents-first.util';

const computeViewFilterGroupOperations = ({
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
  optimisticFlatViewFilterGroupMaps: FlatViewFilterGroupMaps;
} => {
  const filterGroupsToCreate: FlatViewFilterGroup[] = [];
  const filterGroupsToUpdate: FlatViewFilterGroup[] = [];
  const inputFilterGroupIds = new Set(
    inputFilterGroups.map((filterGroup) => filterGroup.id).filter(isDefined),
  );

  let optimisticFlatViewFilterGroupMaps = flatViewFilterGroupMaps;

  for (const inputGroup of sortViewFilterGroupInputsParentsFirst(
    inputFilterGroups,
  )) {
    const existingGroup = isDefined(inputGroup.id)
      ? existingViewFilterGroups.find(
          (filterGroup) => filterGroup.id === inputGroup.id,
        )
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
        flatEntityMaps: {
          flatViewMaps,
          flatViewFilterGroupMaps: optimisticFlatViewFilterGroupMaps,
        },
      });

      const filterGroupToCreate: FlatViewFilterGroup = {
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
        positionInViewFilterGroup: inputGroup.positionInViewFilterGroup ?? null,
        viewFilterIds: [],
        viewFilterUniversalIdentifiers: [],
        childViewFilterGroupIds: [],
        childViewFilterGroupUniversalIdentifiers: [],
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      };

      filterGroupsToCreate.push(filterGroupToCreate);

      optimisticFlatViewFilterGroupMaps = addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: filterGroupToCreate,
        flatEntityMaps: optimisticFlatViewFilterGroupMaps,
      });
    } else {
      const logicalOperator =
        inputGroup.logicalOperator ?? existingGroup.logicalOperator;
      // undefined keeps the saved value, null moves the group to the root
      const positionInViewFilterGroup =
        inputGroup.positionInViewFilterGroup === undefined
          ? existingGroup.positionInViewFilterGroup
          : inputGroup.positionInViewFilterGroup;
      const resolvedParentId =
        inputGroup.parentViewFilterGroupId === undefined
          ? existingGroup.parentViewFilterGroupId
          : inputGroup.parentViewFilterGroupId;

      const hasChanged =
        logicalOperator !== existingGroup.logicalOperator ||
        positionInViewFilterGroup !== existingGroup.positionInViewFilterGroup ||
        resolvedParentId !== existingGroup.parentViewFilterGroupId;

      if (hasChanged) {
        const { parentViewFilterGroupUniversalIdentifier } =
          resolveEntityRelationUniversalIdentifiers({
            metadataName: 'viewFilterGroup',
            foreignKeyValues: {
              parentViewFilterGroupId: resolvedParentId,
            },
            flatEntityMaps: {
              flatViewFilterGroupMaps: optimisticFlatViewFilterGroupMaps,
            },
          });

        filterGroupsToUpdate.push({
          ...existingGroup,
          logicalOperator,
          positionInViewFilterGroup,
          parentViewFilterGroupId: resolvedParentId,
          parentViewFilterGroupUniversalIdentifier,
          updatedAt: now,
        });
      }
    }
  }

  const filterGroupsToRemove = existingViewFilterGroups.filter(
    (filterGroup) => !inputFilterGroupIds.has(filterGroup.id),
  );

  return {
    filterGroupsToCreate,
    filterGroupsToUpdate,
    filterGroupsToRemove,
    optimisticFlatViewFilterGroupMaps,
  };
};

const computeViewFilterOperations = ({
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
} => {
  const filtersToCreate: FlatViewFilter[] = [];
  const filtersToUpdate: FlatViewFilter[] = [];
  const inputFilterIds = new Set(
    inputFilters.map((filter) => filter.id).filter(isDefined),
  );

  for (const inputFilter of inputFilters) {
    const existingFilter = isDefined(inputFilter.id)
      ? existingViewFilters.find((filter) => filter.id === inputFilter.id)
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
      const referencedFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: inputFilter.fieldMetadataId,
        flatEntityMaps: flatFieldMetadataMaps,
      });
      const relationTargetFieldMetadata = isDefined(
        inputFilter.relationTargetFieldMetadataId,
      )
        ? findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: inputFilter.relationTargetFieldMetadataId,
            flatEntityMaps: flatFieldMetadataMaps,
          })
        : undefined;
      const operand =
        inputFilter.operand ??
        (isDefined(referencedFieldMetadata)
          ? getDefaultViewFilterOperand({
              fieldType: referencedFieldMetadata.type,
              subFieldName: inputFilter.subFieldName,
              relationTargetFieldType: relationTargetFieldMetadata?.type,
            })
          : undefined) ??
        ViewFilterOperand.CONTAINS;

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
        operand,
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
          // Undefined keeps the stored value, null clears it
          viewFilterGroupId:
            inputFilter.viewFilterGroupId === undefined
              ? existingFilter.viewFilterGroupId
              : inputFilter.viewFilterGroupId,
          viewFilterGroupUniversalIdentifier,
          positionInViewFilterGroup:
            inputFilter.positionInViewFilterGroup === undefined
              ? existingFilter.positionInViewFilterGroup
              : inputFilter.positionInViewFilterGroup,
          subFieldName:
            inputFilter.subFieldName === undefined
              ? existingFilter.subFieldName
              : inputFilter.subFieldName,
          relationTargetFieldMetadataId:
            inputFilter.relationTargetFieldMetadataId ?? null,
          relationTargetFieldMetadataUniversalIdentifier,
          updatedAt: now,
        });
      }
    }
  }

  const filtersToRemove = existingViewFilters.filter(
    (filter) => !inputFilterIds.has(filter.id),
  );

  return { filtersToCreate, filtersToUpdate, filtersToRemove };
};

const computeViewSortOperations = ({
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
} => {
  const sortsToCreate: FlatViewSort[] = [];
  const sortsToUpdate: FlatViewSort[] = [];
  const inputSortIds = new Set(
    inputSorts.map((sort) => sort.id).filter(isDefined),
  );

  for (const inputSort of inputSorts) {
    const existingSort = isDefined(inputSort.id)
      ? existingViewSorts.find((sort) => sort.id === inputSort.id)
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
        subFieldName: inputSort.subFieldName ?? null,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      });
    } else {
      const hasChanged =
        existingSort.fieldMetadataId !== inputSort.fieldMetadataId ||
        existingSort.direction !== inputSort.direction ||
        (inputSort.subFieldName !== undefined &&
          existingSort.subFieldName !== inputSort.subFieldName);

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
          subFieldName:
            inputSort.subFieldName === undefined
              ? existingSort.subFieldName
              : inputSort.subFieldName,
          updatedAt: now,
        });
      }
    }
  }

  const sortsToRemove = existingViewSorts.filter(
    (sort) => !inputSortIds.has(sort.id),
  );

  return { sortsToCreate, sortsToUpdate, sortsToRemove };
};

type ViewFiltersAndSortsUpsertFlatOperations = {
  viewFilterGroup: FlatEntityToCreateDeleteUpdate<'viewFilterGroup'>;
  viewFilter: FlatEntityToCreateDeleteUpdate<'viewFilter'>;
  viewSort: FlatEntityToCreateDeleteUpdate<'viewSort'>;
};

// Diffs the given children against the view's current ones by id; an omitted list leaves that kind untouched
export const buildViewFiltersAndSortsUpsertFlatOperations = ({
  viewId,
  workspaceId,
  applicationId,
  applicationUniversalIdentifier,
  now,
  viewFilterGroups,
  viewFilters,
  viewSorts,
  flatFieldMetadataMaps,
  flatViewMaps,
  flatViewFilterMaps,
  flatViewFilterGroupMaps,
  flatViewSortMaps,
}: {
  viewId: string;
  workspaceId: string;
  applicationId: string;
  applicationUniversalIdentifier: string;
  now: string;
  viewFilterGroups?: UpsertViewWidgetViewFilterGroupInput[];
  viewFilters?: UpsertViewWidgetViewFilterInput[];
  viewSorts?: UpsertViewWidgetViewSortInput[];
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatViewMaps: FlatViewMaps;
  flatViewFilterMaps: FlatViewFilterMaps;
  flatViewFilterGroupMaps: FlatViewFilterGroupMaps;
  flatViewSortMaps: FlatViewSortMaps;
}): ViewFiltersAndSortsUpsertFlatOperations => {
  const upsertContext = {
    viewId,
    workspaceId,
    applicationId,
    applicationUniversalIdentifier,
    now,
  };

  const viewFilterGroupOperations = isDefined(viewFilterGroups)
    ? computeViewFilterGroupOperations({
        inputFilterGroups: viewFilterGroups,
        existingViewFilterGroups: Object.values(
          flatViewFilterGroupMaps.byUniversalIdentifier,
        )
          .filter(isDefined)
          .filter((group) => group.viewId === viewId),
        ...upsertContext,
        flatViewMaps,
        flatViewFilterGroupMaps,
      })
    : {
        filterGroupsToCreate: [],
        filterGroupsToUpdate: [],
        filterGroupsToRemove: [],
        optimisticFlatViewFilterGroupMaps: flatViewFilterGroupMaps,
      };

  const viewFilterOperations = isDefined(viewFilters)
    ? computeViewFilterOperations({
        inputFilters: viewFilters,
        existingViewFilters: Object.values(
          flatViewFilterMaps.byUniversalIdentifier,
        )
          .filter(isDefined)
          .filter((filter) => filter.viewId === viewId),
        ...upsertContext,
        flatFieldMetadataMaps,
        flatViewMaps,
        flatViewFilterGroupMaps:
          viewFilterGroupOperations.optimisticFlatViewFilterGroupMaps,
      })
    : { filtersToCreate: [], filtersToUpdate: [], filtersToRemove: [] };

  const viewSortOperations = isDefined(viewSorts)
    ? computeViewSortOperations({
        inputSorts: viewSorts,
        existingViewSorts: Object.values(flatViewSortMaps.byUniversalIdentifier)
          .filter(isDefined)
          .filter((sort) => sort.viewId === viewId),
        ...upsertContext,
        flatFieldMetadataMaps,
        flatViewMaps,
      })
    : { sortsToCreate: [], sortsToUpdate: [], sortsToRemove: [] };

  const removalContext = {
    workspaceCustomApplicationUniversalIdentifier:
      applicationUniversalIdentifier,
    now,
  };

  const {
    toHardDelete: filterGroupsToDelete,
    toDeactivate: filterGroupsToDeactivate,
  } = splitEntitiesByRemovalStrategy({
    metadataName: 'viewFilterGroup',
    entitiesToRemove: viewFilterGroupOperations.filterGroupsToRemove,
    ...removalContext,
  });

  const { toHardDelete: filtersToDelete, toDeactivate: filtersToDeactivate } =
    splitEntitiesByRemovalStrategy({
      metadataName: 'viewFilter',
      entitiesToRemove: viewFilterOperations.filtersToRemove,
      ...removalContext,
    });

  const { toHardDelete: sortsToDelete, toDeactivate: sortsToDeactivate } =
    splitEntitiesByRemovalStrategy({
      metadataName: 'viewSort',
      entitiesToRemove: viewSortOperations.sortsToRemove,
      ...removalContext,
    });

  return {
    viewFilterGroup: {
      flatEntityToCreate: viewFilterGroupOperations.filterGroupsToCreate,
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
  };
};
