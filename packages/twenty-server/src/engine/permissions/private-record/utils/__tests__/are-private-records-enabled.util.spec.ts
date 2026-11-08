import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FeatureFlagKey } from 'twenty-shared/types';

import { arePrivateRecordsEnabled } from 'src/engine/permissions/private-record/utils/are-private-records-enabled.util';

const ORDINARY_OBJECT = {
  universalIdentifier: STANDARD_OBJECTS.company.universalIdentifier,
};

describe('arePrivateRecordsEnabled', () => {
  it('should be off on an ordinary object with both flags off', () => {
    expect(
      arePrivateRecordsEnabled({
        flatObjectMetadata: ORDINARY_OBJECT,
        featureFlagsMap: {},
      }),
    ).toBe(false);
  });

  it.each([
    { [FeatureFlagKey.IS_PRIVATE_RECORDS_ENABLED]: true },
    { [FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED]: true },
    { [FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED]: false },
  ])('should be on with %j', (featureFlagsMap) => {
    expect(
      arePrivateRecordsEnabled({
        flatObjectMetadata: ORDINARY_OBJECT,
        featureFlagsMap,
      }),
    ).toBe(true);
  });

  it.each([
    STANDARD_OBJECTS.agentChatThread.universalIdentifier,
    STANDARD_OBJECTS.agentChatThreadParticipant.universalIdentifier,
  ])(
    'should stay on for AI chat object %s with both flags off',
    (universalIdentifier) => {
      expect(
        arePrivateRecordsEnabled({
          flatObjectMetadata: { universalIdentifier },
          featureFlagsMap: {},
        }),
      ).toBe(true);
    },
  );
});
