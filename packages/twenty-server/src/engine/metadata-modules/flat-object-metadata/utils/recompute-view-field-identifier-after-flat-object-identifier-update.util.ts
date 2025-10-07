import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatViewField } from 'src/engine/core-modules/view/flat-view/types/flat-view-field.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { DEFAULT_VIEW_FIELD_SIZE } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/constants/DEFAULT_VIEW_FIELD_SIZE';

type RecomputeViewFieldIdentifierAfterFlatObjectIdentifierUpdateArgs = {
  existingFlatObjectMetadata: FlatObjectMetadata;
  updatedLabelIdentifierFieldMetadataId: string;
} & Pick<AllFlatEntityMaps, 'flatViewFieldMaps' | 'flatViewMaps'>;

type FlatViewFieldToCreateAndUpdate = {
  flatViewFieldToCreate: FlatViewField[];
  flatViewFieldToUpdate: FlatViewField[];
};
export const recomputeViewFieldIdentifierAfterFlatObjectIdentifierUpdate = ({
  existingFlatObjectMetadata,
  flatViewFieldMaps,
  flatViewMaps,
  updatedLabelIdentifierFieldMetadataId,
}: RecomputeViewFieldIdentifierAfterFlatObjectIdentifierUpdateArgs): FlatViewFieldToCreateAndUpdate => {
  const flatViews = findManyFlatEntityByIdInFlatEntityMapsOrThrow({
    flatEntityMaps: flatViewMaps,
    flatEntityIds: existingFlatObjectMetadata.viewIds,
  });

  const accumulator: FlatViewFieldToCreateAndUpdate = {
    flatViewFieldToCreate: [],
    flatViewFieldToUpdate: [],
  };

  for (const flatView of flatViews) {
    const flatViewFields = findManyFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityIds: flatView.viewFieldIds,
      flatEntityMaps: flatViewFieldMaps,
    });
    const labelMetadataIdentifierViewField = flatViewFields.find(
      (viewField) =>
        viewField.fieldMetadataId === updatedLabelIdentifierFieldMetadataId,
    );

    const ascSortedViewFieldPositions = flatViewFields
      .map(({ position }) => position)
      .sort();
    const lowestViewFieldPosition =
      ascSortedViewFieldPositions.length > 0
        ? ascSortedViewFieldPositions[0]
        : 0;

    if (!isDefined(labelMetadataIdentifierViewField)) {
      const viewFieldId = v4();
      const createdAt = new Date();
      const flatViewFieldToCreate: FlatViewField = {
        fieldMetadataId: updatedLabelIdentifierFieldMetadataId,
        position: lowestViewFieldPosition - 1,
        isVisible: true,
        size: DEFAULT_VIEW_FIELD_SIZE,
        viewId: flatView.id,
        workspaceId: flatView.workspaceId,
        id: viewFieldId,
        createdAt: createdAt,
        updatedAt: createdAt,
        deletedAt: null,
        universalIdentifier: viewFieldId,
        aggregateOperation: null,
      };

      accumulator.flatViewFieldToCreate.push(flatViewFieldToCreate);
    } else if (
      labelMetadataIdentifierViewField.position > lowestViewFieldPosition
    ) {
      const updatedFlatViewField = {
        ...labelMetadataIdentifierViewField,
        position: lowestViewFieldPosition - 1,
      };

      accumulator.flatViewFieldToUpdate.push(updatedFlatViewField);
    }
  }

  return accumulator;
};
