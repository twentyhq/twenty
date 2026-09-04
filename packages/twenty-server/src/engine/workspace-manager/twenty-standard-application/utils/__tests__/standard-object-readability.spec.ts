import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { MetadataReadability, MetadataWritability } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const WORKSPACE_ID = '20202020-1111-4111-8111-111111111111';
const TWENTY_STANDARD_APPLICATION_ID = '20202020-2222-4222-8222-222222222222';
const NOW = '2024-01-01T00:00:00.000Z';

const NON_OPEN_STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS: string[] = [
  STANDARD_OBJECTS.recordShare.universalIdentifier,
  STANDARD_OBJECTS.callRecording.universalIdentifier,
];

describe('Standard object readability', () => {
  const { allFlatEntityMaps } =
    computeTwentyStandardApplicationAllFlatEntityMaps({
      now: NOW,
      workspaceId: WORKSPACE_ID,
      twentyStandardApplicationId: TWENTY_STANDARD_APPLICATION_ID,
    });

  const standardFlatObjectMetadatas = Object.values(
    allFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined);

  const findStandardFlatObjectMetadata = (universalIdentifier: string) =>
    standardFlatObjectMetadatas.find(
      (flatObjectMetadata) =>
        flatObjectMetadata.universalIdentifier === universalIdentifier,
    );

  const otherStandardFlatObjectMetadatas = standardFlatObjectMetadatas.filter(
    (flatObjectMetadata) =>
      !NON_OPEN_STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.includes(
        flatObjectMetadata.universalIdentifier,
      ),
  );

  it('declares recordShare SYSTEM for readability and writability', () => {
    expect(
      findStandardFlatObjectMetadata(
        STANDARD_OBJECTS.recordShare.universalIdentifier,
      ),
    ).toMatchObject({
      readability: MetadataReadability.SYSTEM,
      writability: MetadataWritability.SYSTEM,
    });
  });

  it('declares callRecording PRIVATE for readability and OPEN for writability', () => {
    expect(
      findStandardFlatObjectMetadata(
        STANDARD_OBJECTS.callRecording.universalIdentifier,
      ),
    ).toMatchObject({
      readability: MetadataReadability.PRIVATE,
      writability: MetadataWritability.OPEN,
    });
  });

  it('leaves every other standard object OPEN', () => {
    const readabilities = new Set(
      otherStandardFlatObjectMetadatas.map(
        (flatObjectMetadata) => flatObjectMetadata.readability,
      ),
    );
    const writabilities = new Set(
      otherStandardFlatObjectMetadatas.map(
        (flatObjectMetadata) => flatObjectMetadata.writability,
      ),
    );

    expect(otherStandardFlatObjectMetadatas.length).toBeGreaterThan(0);
    expect([...readabilities]).toEqual([MetadataReadability.OPEN]);
    expect([...writabilities]).toEqual([MetadataWritability.OPEN]);
  });
});
