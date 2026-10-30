/* @license Enterprise */

import { getRelatedRecordPathUniversalIdentifier } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatRelatedRecordPath } from 'src/engine/metadata-modules/flat-related-record-path/types/flat-related-record-path.type';
import {
  STANDARD_RELATED_RECORD_PATHS,
  type StandardRelatedRecordPath,
} from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-related-record-paths.constant';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';
import { type StandardObjectMetadataRelatedEntityIds } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-object-metadata-related-entity-ids.util';

type StandardRelatedRecordPathHop = {
  fieldMetadataId: string;
  fieldMetadataUniversalIdentifier: string;
};

const STANDARD_OBJECT_NAME_BY_UNIVERSAL_IDENTIFIER = new Map<
  string,
  AllStandardObjectName
>(
  (Object.keys(STANDARD_OBJECTS) as AllStandardObjectName[]).map(
    (objectName) => [
      STANDARD_OBJECTS[objectName].universalIdentifier,
      objectName,
    ],
  ),
);

const resolveStandardRelatedRecordPathHops = ({
  standardRelatedRecordPath: { objectName, fieldNames },
  standardObjectMetadataRelatedEntityIds,
  flatFieldMetadataMaps,
}: {
  standardRelatedRecordPath: StandardRelatedRecordPath;
  standardObjectMetadataRelatedEntityIds: StandardObjectMetadataRelatedEntityIds;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): StandardRelatedRecordPathHop[] => {
  let currentObjectName: AllStandardObjectName | undefined = objectName;

  return fieldNames.map((fieldName) => {
    if (!isDefined(currentObjectName)) {
      throw new Error(
        `Standard related record path ${objectName}.${fieldNames.join('.')} leaves the standard objects`,
      );
    }

    const objectFields: Record<string, { universalIdentifier: string }> =
      STANDARD_OBJECTS[currentObjectName].fields;
    const objectFieldIds: Record<string, { id: string }> =
      standardObjectMetadataRelatedEntityIds[currentObjectName].fields;
    const fieldMetadataUniversalIdentifier =
      objectFields[fieldName].universalIdentifier;
    const flatFieldMetadata = findFlatEntityByUniversalIdentifierOrThrow({
      universalIdentifier: fieldMetadataUniversalIdentifier,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    currentObjectName = isDefined(
      flatFieldMetadata.relationTargetObjectMetadataUniversalIdentifier,
    )
      ? STANDARD_OBJECT_NAME_BY_UNIVERSAL_IDENTIFIER.get(
          flatFieldMetadata.relationTargetObjectMetadataUniversalIdentifier,
        )
      : undefined;

    return {
      fieldMetadataId: objectFieldIds[fieldName].id,
      fieldMetadataUniversalIdentifier,
    };
  });
};

export const buildStandardFlatRelatedRecordPathMaps = ({
  now,
  workspaceId,
  twentyStandardApplicationId,
  standardObjectMetadataRelatedEntityIds,
  dependencyFlatEntityMaps: { flatFieldMetadataMaps },
}: {
  now: string;
  workspaceId: string;
  twentyStandardApplicationId: string;
  standardObjectMetadataRelatedEntityIds: StandardObjectMetadataRelatedEntityIds;
  dependencyFlatEntityMaps: {
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  };
}): FlatEntityMaps<FlatRelatedRecordPath> => {
  let flatRelatedRecordPathMaps = createEmptyFlatEntityMaps();

  for (const standardRelatedRecordPath of STANDARD_RELATED_RECORD_PATHS) {
    const [firstHop, secondHop, thirdHop] =
      resolveStandardRelatedRecordPathHops({
        standardRelatedRecordPath,
        standardObjectMetadataRelatedEntityIds,
        flatFieldMetadataMaps,
      });

    flatRelatedRecordPathMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: {
        id: v4(),
        universalIdentifier: getRelatedRecordPathUniversalIdentifier({
          applicationUniversalIdentifier:
            TWENTY_STANDARD_APPLICATION.universalIdentifier,
          fieldMetadataUniversalIdentifiers: [firstHop, secondHop, thirdHop]
            .filter(isDefined)
            .map((hop) => hop.fieldMetadataUniversalIdentifier),
        }),
        objectMetadataId:
          standardObjectMetadataRelatedEntityIds[
            standardRelatedRecordPath.objectName
          ].id,
        objectMetadataUniversalIdentifier:
          STANDARD_OBJECTS[standardRelatedRecordPath.objectName]
            .universalIdentifier,
        firstFieldMetadataId: firstHop.fieldMetadataId,
        firstFieldMetadataUniversalIdentifier:
          firstHop.fieldMetadataUniversalIdentifier,
        secondFieldMetadataId: secondHop?.fieldMetadataId ?? null,
        secondFieldMetadataUniversalIdentifier:
          secondHop?.fieldMetadataUniversalIdentifier ?? null,
        thirdFieldMetadataId: thirdHop?.fieldMetadataId ?? null,
        thirdFieldMetadataUniversalIdentifier:
          thirdHop?.fieldMetadataUniversalIdentifier ?? null,
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
