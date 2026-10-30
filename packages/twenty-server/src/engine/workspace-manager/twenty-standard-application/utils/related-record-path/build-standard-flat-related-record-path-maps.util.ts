/* @license Enterprise */

import { getRelatedRecordPathUniversalIdentifier } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import {
  RelatedRecordPathException,
  RelatedRecordPathExceptionCode,
} from 'src/engine/metadata-modules/related-record-path/related-record-path.exception';
import { type FlatRelatedRecordPath } from 'src/engine/metadata-modules/flat-related-record-path/types/flat-related-record-path.type';
import {
  STANDARD_RELATED_RECORD_PATHS,
  type StandardRelatedRecordPath,
} from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-related-record-paths.constant';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { type StandardObjectMetadataRelatedEntityIds } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-object-metadata-related-entity-ids.util';

type StandardRelatedRecordPathHop = {
  fieldMetadataId: string;
  fieldMetadataUniversalIdentifier: string;
};

const getFieldKey = ({
  objectMetadataUniversalIdentifier,
  name,
}: {
  objectMetadataUniversalIdentifier: string | null;
  name: string;
}) => `${objectMetadataUniversalIdentifier}:${name}`;

const resolveStandardRelatedRecordPathHopsOrThrow = ({
  standardRelatedRecordPath: { objectName, fieldNames },
  flatFieldMetadataByFieldKey,
}: {
  standardRelatedRecordPath: StandardRelatedRecordPath;
  flatFieldMetadataByFieldKey: Map<string, FlatFieldMetadata>;
}): StandardRelatedRecordPathHop[] => {
  let currentObjectMetadataUniversalIdentifier: string | null =
    STANDARD_OBJECTS[objectName].universalIdentifier;

  return fieldNames.map((fieldName) => {
    const flatFieldMetadata = flatFieldMetadataByFieldKey.get(
      getFieldKey({
        objectMetadataUniversalIdentifier:
          currentObjectMetadataUniversalIdentifier,
        name: fieldName,
      }),
    );

    if (!isDefined(flatFieldMetadata)) {
      throw new RelatedRecordPathException(
        `Standard related record path ${objectName}.${fieldNames.join('.')} does not resolve at ${fieldName}`,
        RelatedRecordPathExceptionCode.INVALID_RELATED_RECORD_PATH_INPUT,
      );
    }

    currentObjectMetadataUniversalIdentifier =
      flatFieldMetadata.relationTargetObjectMetadataUniversalIdentifier;

    return {
      fieldMetadataId: flatFieldMetadata.id,
      fieldMetadataUniversalIdentifier: flatFieldMetadata.universalIdentifier,
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
  const flatFieldMetadataByFieldKey = new Map(
    Object.values(flatFieldMetadataMaps.byUniversalIdentifier)
      .filter(isDefined)
      .map((flatFieldMetadata) => [
        getFieldKey(flatFieldMetadata),
        flatFieldMetadata,
      ]),
  );

  for (const standardRelatedRecordPath of STANDARD_RELATED_RECORD_PATHS) {
    const [firstHop, secondHop, thirdHop, fourthHop] =
      resolveStandardRelatedRecordPathHopsOrThrow({
        standardRelatedRecordPath,
        flatFieldMetadataByFieldKey,
      });

    flatRelatedRecordPathMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: {
        id: v4(),
        universalIdentifier: getRelatedRecordPathUniversalIdentifier({
          applicationUniversalIdentifier:
            TWENTY_STANDARD_APPLICATION.universalIdentifier,
          fieldMetadataUniversalIdentifiers: [
            firstHop,
            secondHop,
            thirdHop,
            fourthHop,
          ]
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
        fourthFieldMetadataId: fourthHop?.fieldMetadataId ?? null,
        fourthFieldMetadataUniversalIdentifier:
          fourthHop?.fieldMetadataUniversalIdentifier ?? null,
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
