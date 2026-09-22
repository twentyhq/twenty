import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const { allFlatEntityMaps } = computeTwentyStandardApplicationAllFlatEntityMaps(
  {
    now: '2026-09-22T00:00:00.000Z',
    workspaceId: '20202020-1111-4111-8111-111111111111',
    twentyStandardApplicationId: '20202020-2222-4222-8222-222222222222',
  },
);

const findIndex = (
  indexName: keyof typeof STANDARD_OBJECTS.agentChatThreadTarget.indexes,
) =>
  allFlatEntityMaps.flatIndexMaps.byUniversalIdentifier[
    STANDARD_OBJECTS.agentChatThreadTarget.indexes[indexName]
      .universalIdentifier
  ];

describe('agent chat thread target workspace metadata', () => {
  // Attach is ON CONFLICT DO NOTHING against this index, so losing its
  // uniqueness or its partial predicate would silently turn a repeated attach
  // into duplicate links rather than a no-op.
  it('keeps one live link per thread and record', () => {
    expect(findIndex('threadTargetUniqueIndex')).toMatchObject({
      isUnique: true,
      indexWhereClause: '"deletedAt" IS NULL',
    });
  });

  it('indexes the pair the record lookup filters on', () => {
    const targetRecordIndex = findIndex('targetRecordIndex');

    expect(isDefined(targetRecordIndex)).toBe(true);
    expect(targetRecordIndex).toMatchObject({ isUnique: false });
  });

  it('indexes the thread side the relation cascades from', () => {
    expect(isDefined(findIndex('threadIdIndex'))).toBe(true);
  });
});
