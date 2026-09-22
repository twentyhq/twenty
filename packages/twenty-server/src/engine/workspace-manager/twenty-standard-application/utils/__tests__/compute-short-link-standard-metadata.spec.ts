import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { MetadataReadability, MetadataWritability } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const WORKSPACE_ID = '20202020-1111-4111-8111-111111111111';
const TWENTY_STANDARD_APPLICATION_ID = '20202020-2222-4222-8222-222222222222';
const NOW = '2024-01-01T00:00:00.000Z';

describe('ShortLink standard metadata build', () => {
  const { allFlatEntityMaps } =
    computeTwentyStandardApplicationAllFlatEntityMaps({
      now: NOW,
      workspaceId: WORKSPACE_ID,
      twentyStandardApplicationId: TWENTY_STANDARD_APPLICATION_ID,
    });
  const shortLink =
    allFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier[
      STANDARD_OBJECTS.shortLink.universalIdentifier
    ];

  it('creates a workspace owned system object with a destination URL', () => {
    expect(shortLink).toMatchObject({
      nameSingular: 'shortLink',
      isSystem: true,
      isUICreatable: false,
      isUIEditable: false,
      readability: MetadataReadability.SYSTEM,
      writability: MetadataWritability.SYSTEM,
    });

    const fields = Object.values(
      allFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier,
    ).filter(isDefined);

    const shortLinkFieldNames = fields
      .filter((field) => field.objectMetadataId === shortLink?.id)
      .map((field) => field.name);

    expect(shortLinkFieldNames.filter((name) => name.endsWith('Url'))).toEqual([
      'destinationUrl',
    ]);
    expect(shortLinkFieldNames).not.toContain('identityHash');
  });

  it('does not require destination URL deduplication', () => {
    expect(STANDARD_OBJECTS.shortLink.indexes).toEqual({});
  });
});
