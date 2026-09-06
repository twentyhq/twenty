import { MetadataReadability } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const WORKSPACE_ID = '20202020-1111-4111-8111-111111111111';
const TWENTY_STANDARD_APPLICATION_ID = '20202020-2222-4222-8222-222222222222';
const NOW = '2024-01-01T00:00:00.000Z';

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

  it('leaves every standard object OPEN', () => {
    const readabilities = new Set(
      standardFlatObjectMetadatas.map(
        (flatObjectMetadata) => flatObjectMetadata.readability,
      ),
    );

    expect(standardFlatObjectMetadatas.length).toBeGreaterThan(0);
    expect([...readabilities]).toEqual([MetadataReadability.OPEN]);
  });
});
