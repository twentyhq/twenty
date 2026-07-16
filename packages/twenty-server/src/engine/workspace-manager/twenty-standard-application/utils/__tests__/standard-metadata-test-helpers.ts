import { isDefined } from 'twenty-shared/utils';
import type { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

export const WORKSPACE_ID = '20202020-1111-4111-8111-111111111111';
export const TWENTY_STANDARD_APPLICATION_ID =
  '20202020-2222-4222-8222-222222222222';
export const NOW = '2024-01-01T00:00:00.000Z';

type AllFlatEntityMaps = {
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatIndexMaps: FlatEntityMaps<FlatIndexMetadata>;
};

export const setupAllFlatEntityMaps = (): AllFlatEntityMaps => {
  const { allFlatEntityMaps } =
    computeTwentyStandardApplicationAllFlatEntityMaps({
      now: NOW,
      workspaceId: WORKSPACE_ID,
      twentyStandardApplicationId: TWENTY_STANDARD_APPLICATION_ID,
    });

  return allFlatEntityMaps;
};

export const assertStandardObjectExists = (
  allFlatEntityMaps: AllFlatEntityMaps,
  objectName: AllStandardObjectName,
  standardObjects: typeof STANDARD_OBJECTS,
): void => {
  const { byUniversalIdentifier } = allFlatEntityMaps.flatObjectMetadataMaps;

  expect(
    byUniversalIdentifier[standardObjects[objectName].universalIdentifier],
  ).toBeDefined();
};

export const assertStandardObjectIsSystem = (
  allFlatEntityMaps: AllFlatEntityMaps,
  objectName: AllStandardObjectName,
  standardObjects: typeof STANDARD_OBJECTS,
): void => {
  const obj =
    allFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier[
      standardObjects[objectName].universalIdentifier
    ];

  expect(obj?.isSystem).toBe(true);
};

export const assertAllStandardFieldsBuilt = (
  allFlatEntityMaps: AllFlatEntityMaps,
  objectName: AllStandardObjectName,
  standardObjects: typeof STANDARD_OBJECTS,
): void => {
  const { byUniversalIdentifier } = allFlatEntityMaps.flatFieldMetadataMaps;

  const fieldIdentifiers = Object.values(standardObjects[objectName].fields)
    .filter(isDefined)
    .map((field) => field.universalIdentifier);

  for (const fieldId of fieldIdentifiers) {
    expect(byUniversalIdentifier[fieldId]).toBeDefined();
  }
};

export const assertAllStandardIndexesBuilt = (
  allFlatEntityMaps: AllFlatEntityMaps,
  objectName: AllStandardObjectName,
  standardObjects: typeof STANDARD_OBJECTS,
): void => {
  const indexes = standardObjects[objectName].indexes;

  if (!indexes || Object.keys(indexes).length === 0) {
    return;
  }

  const { byUniversalIdentifier } = allFlatEntityMaps.flatIndexMaps;

  const indexIdentifiers = Object.values(indexes)
    .filter(isDefined)
    .map((index) => index.universalIdentifier);

  for (const indexId of indexIdentifiers) {
    expect(byUniversalIdentifier[indexId]).toBeDefined();
  }
};
