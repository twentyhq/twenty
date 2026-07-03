import {
  type ViewFilterOperand,
  type ViewSortDirection,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatEntityToCreateDeleteUpdate } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-to-create-delete-update.type';
import { fromCreateViewFieldInputToFlatViewFieldToCreate } from 'src/engine/metadata-modules/flat-view-field/utils/from-create-view-field-input-to-flat-view-field-to-create.util';
import { fromCreateViewFilterInputToFlatViewFilterToCreate } from 'src/engine/metadata-modules/flat-view-filter/utils/from-create-view-filter-input-to-flat-view-filter-to-create.util';
import { fromCreateViewSortInputToFlatViewSortToCreate } from 'src/engine/metadata-modules/flat-view-sort/utils/from-create-view-sort-input-to-flat-view-sort-to-create.util';
import { type ViewFilterValue } from 'src/engine/metadata-modules/view-filter/types/view-filter-value.type';

// Resolved children specs (field names already resolved to fieldMetadataId)
export type CompleteViewFieldSpec = {
  fieldMetadataId: string;
  isVisible: boolean;
  size: number;
};

export type CompleteViewFilterSpec = {
  fieldMetadataId: string;
  operand: ViewFilterOperand;
  value: ViewFilterValue;
  subFieldName?: string;
};

export type CompleteViewSortSpec = {
  fieldMetadataId: string;
  direction: ViewSortDirection;
};

type BuildCompleteViewChildrenFlatOperationsArgs = {
  viewId: string;
  flatApplication: FlatApplication;
  fields?: CompleteViewFieldSpec[];
  filters?: CompleteViewFilterSpec[];
  sorts?: CompleteViewSortSpec[];
} & Pick<
  AllFlatEntityMaps,
  | 'flatFieldMetadataMaps'
  | 'flatViewMaps'
  | 'flatViewFieldMaps'
  | 'flatViewFilterMaps'
  | 'flatViewSortMaps'
  | 'flatViewFieldGroupMaps'
  | 'flatViewFilterGroupMaps'
>;

type CompleteViewChildrenFlatOperations = {
  viewField?: FlatEntityToCreateDeleteUpdate<'viewField'>;
  viewFilter?: FlatEntityToCreateDeleteUpdate<'viewFilter'>;
  viewSort?: FlatEntityToCreateDeleteUpdate<'viewSort'>;
};

export const buildCompleteViewChildrenFlatOperations = ({
  viewId,
  flatApplication,
  flatFieldMetadataMaps,
  flatViewMaps,
  flatViewFieldMaps,
  flatViewFilterMaps,
  flatViewSortMaps,
  flatViewFieldGroupMaps,
  flatViewFilterGroupMaps,
  fields,
  filters,
  sorts,
}: BuildCompleteViewChildrenFlatOperationsArgs): CompleteViewChildrenFlatOperations => {
  const operations: CompleteViewChildrenFlatOperations = {};

  if (isDefined(fields)) {
    const existingFlatViewFields = Object.values(
      flatViewFieldMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((flatViewField) => flatViewField.viewId === viewId);

    const flatViewFieldsToCreate = fields.map((field, index) =>
      fromCreateViewFieldInputToFlatViewFieldToCreate({
        createViewFieldInput: {
          viewId,
          fieldMetadataId: field.fieldMetadataId,
          isVisible: field.isVisible,
          size: field.size,
          position: index,
        },
        flatApplication,
        flatFieldMetadataMaps,
        flatViewMaps,
        flatViewFieldGroupMaps,
      }),
    );

    operations.viewField = {
      flatEntityToCreate: flatViewFieldsToCreate,
      flatEntityToDelete: existingFlatViewFields,
      flatEntityToUpdate: [],
    };
  }

  if (isDefined(filters)) {
    const existingFlatViewFilters = Object.values(
      flatViewFilterMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((flatViewFilter) => flatViewFilter.viewId === viewId);

    const flatViewFiltersToCreate = filters.map((filter) =>
      fromCreateViewFilterInputToFlatViewFilterToCreate({
        createViewFilterInput: {
          viewId,
          fieldMetadataId: filter.fieldMetadataId,
          operand: filter.operand,
          value: filter.value,
          subFieldName: filter.subFieldName,
        },
        flatApplication,
        flatFieldMetadataMaps,
        flatViewMaps,
        flatViewFilterGroupMaps,
      }),
    );

    operations.viewFilter = {
      flatEntityToCreate: flatViewFiltersToCreate,
      flatEntityToDelete: existingFlatViewFilters,
      flatEntityToUpdate: [],
    };
  }

  if (isDefined(sorts)) {
    const existingFlatViewSorts = Object.values(
      flatViewSortMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((flatViewSort) => flatViewSort.viewId === viewId);

    const flatViewSortsToCreate = sorts.map((sort) =>
      fromCreateViewSortInputToFlatViewSortToCreate({
        createViewSortInput: {
          viewId,
          fieldMetadataId: sort.fieldMetadataId,
          direction: sort.direction,
        },
        flatApplication,
        flatFieldMetadataMaps,
        flatViewMaps,
      }),
    );

    operations.viewSort = {
      flatEntityToCreate: flatViewSortsToCreate,
      flatEntityToDelete: existingFlatViewSorts,
      flatEntityToUpdate: [],
    };
  }

  return operations;
};
