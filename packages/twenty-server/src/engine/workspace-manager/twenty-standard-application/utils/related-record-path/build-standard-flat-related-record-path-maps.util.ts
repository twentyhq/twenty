/* @license Enterprise */

import { getRelatedRecordPathUniversalIdentifier } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { v4 } from 'uuid';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatRelatedRecordPath } from 'src/engine/metadata-modules/flat-related-record-path/types/flat-related-record-path.type';
import {
  STANDARD_RELATED_RECORD_PATHS,
  type StandardRelatedRecordPath,
} from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-related-record-paths.constant';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { type StandardObjectMetadataRelatedEntityIds } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-object-metadata-related-entity-ids.util';

const getStandardFieldUniversalIdentifier = ({
  objectName,
  firstFieldName,
}: StandardRelatedRecordPath): string => {
  const objectFields: Record<string, { universalIdentifier: string }> =
    STANDARD_OBJECTS[objectName].fields;

  return objectFields[firstFieldName].universalIdentifier;
};

export const buildStandardFlatRelatedRecordPathMaps = ({
  now,
  workspaceId,
  twentyStandardApplicationId,
  standardObjectMetadataRelatedEntityIds,
}: {
  now: string;
  workspaceId: string;
  twentyStandardApplicationId: string;
  standardObjectMetadataRelatedEntityIds: StandardObjectMetadataRelatedEntityIds;
}): FlatEntityMaps<FlatRelatedRecordPath> => {
  let flatRelatedRecordPathMaps = createEmptyFlatEntityMaps();

  for (const standardRelatedRecordPath of STANDARD_RELATED_RECORD_PATHS) {
    const { objectName, firstFieldName } = standardRelatedRecordPath;
    const objectFieldIds: Record<string, { id: string }> =
      standardObjectMetadataRelatedEntityIds[objectName].fields;
    const firstFieldMetadataUniversalIdentifier =
      getStandardFieldUniversalIdentifier(standardRelatedRecordPath);

    flatRelatedRecordPathMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: {
        id: v4(),
        universalIdentifier: getRelatedRecordPathUniversalIdentifier({
          applicationUniversalIdentifier:
            TWENTY_STANDARD_APPLICATION.universalIdentifier,
          fieldMetadataUniversalIdentifiers: [
            firstFieldMetadataUniversalIdentifier,
          ],
        }),
        objectMetadataId: standardObjectMetadataRelatedEntityIds[objectName].id,
        objectMetadataUniversalIdentifier:
          STANDARD_OBJECTS[objectName].universalIdentifier,
        firstFieldMetadataId: objectFieldIds[firstFieldName].id,
        firstFieldMetadataUniversalIdentifier,
        secondFieldMetadataId: null,
        secondFieldMetadataUniversalIdentifier: null,
        thirdFieldMetadataId: null,
        thirdFieldMetadataUniversalIdentifier: null,
        workspaceId,
        applicationId: twentyStandardApplicationId,
        applicationUniversalIdentifier:
          TWENTY_STANDARD_APPLICATION.universalIdentifier,
        createdAt: now,
        updatedAt: now,
      },
      flatEntityMaps: flatRelatedRecordPathMaps,
    });
  }

  return flatRelatedRecordPathMaps;
};
