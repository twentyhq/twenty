import {
  STANDARD_OBJECTS,
} from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const WORKSPACE_ID = '20202020-1111-4111-8111-111111111111';
const TWENTY_STANDARD_APPLICATION_ID = '20202020-2222-4222-8222-222222222222';
const NOW = '2024-01-01T00:00:00.000Z';

describe('InboundEventLedger standard metadata build', () => {
  const { allFlatEntityMaps } =
    computeTwentyStandardApplicationAllFlatEntityMaps({
      now: NOW,
      workspaceId: WORKSPACE_ID,
      twentyStandardApplicationId: TWENTY_STANDARD_APPLICATION_ID,
    });

  it('builds the inboundEventLedger object', () => {
    const { byUniversalIdentifier } = allFlatEntityMaps.flatObjectMetadataMaps;

    expect(
      byUniversalIdentifier[
        STANDARD_OBJECTS.inboundEventLedger.universalIdentifier
      ],
    ).toBeDefined();
  });

  it('marks the inboundEventLedger object as system', () => {
    const inboundEventLedger =
      allFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.inboundEventLedger.universalIdentifier
      ];

    expect(inboundEventLedger?.isSystem).toBe(true);
  });

  it('builds all expected fields for inboundEventLedger', () => {
    const { byUniversalIdentifier } = allFlatEntityMaps.flatFieldMetadataMaps;

    const fieldIdentifiers = Object.values(
      STANDARD_OBJECTS.inboundEventLedger.fields,
    )
      .filter(isDefined)
      .map((field) => field.universalIdentifier);

    for (const fieldId of fieldIdentifiers) {
      expect(byUniversalIdentifier[fieldId]).toBeDefined();
    }
  });

  it('builds all expected indexes for inboundEventLedger', () => {
    const { byUniversalIdentifier } = allFlatEntityMaps.flatIndexMaps;

    const indexIdentifiers = Object.values(
      STANDARD_OBJECTS.inboundEventLedger.indexes,
    )
      .filter(isDefined)
      .map((index) => index.universalIdentifier);

    for (const indexId of indexIdentifiers) {
      expect(byUniversalIdentifier[indexId]).toBeDefined();
    }
  });
});
