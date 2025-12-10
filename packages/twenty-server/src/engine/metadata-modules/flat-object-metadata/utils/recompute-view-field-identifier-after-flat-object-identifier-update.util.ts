import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { DEFAULT_VIEW_FIELD_SIZE } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/constants/DEFAULT_VIEW_FIELD_SIZE';

type RecomputeViewFieldIdentifierAfterFlatObjectIdentifierUpdateArgs = {
  existingFlatObjectMetadata: FlatObjectMetadata;
  updatedLabelIdentifierFieldMetadataId: string;
} & Pick<AllFlatEntityMaps, 'flatViewFieldMaps' | 'flatViewMaps'>;

type FlatViewFieldToCreateAndUpdate = {
  flatViewFieldsToCreate: FlatViewField[];
  flatViewFieldsToUpdate: FlatViewField[];
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
    flatViewFieldsToCreate: [],
    flatViewFieldsToUpdate: [],
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
      .sort((a, b) => a - b);
    const lowestViewFieldPosition =
      ascSortedViewFieldPositions.length > 0
        ? ascSortedViewFieldPositions[0]
        : 0;

    if (!isDefined(labelMetadataIdentifierViewField)) {
      const viewFieldId = v4();
      const createdAt = new Date().toISOString();
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
        applicationId: existingFlatObjectMetadata.applicationId,
      };

      accumulator.flatViewFieldsToCreate.push(flatViewFieldToCreate);
    } else if (
      labelMetadataIdentifierViewField.position > lowestViewFieldPosition
    ) {
      const updatedFlatViewField = {
        ...labelMetadataIdentifierViewField,
        position: lowestViewFieldPosition - 1,
      };

      accumulator.flatViewFieldsToUpdate.push(updatedFlatViewField);
    }
  }

  return accumulator;
};
