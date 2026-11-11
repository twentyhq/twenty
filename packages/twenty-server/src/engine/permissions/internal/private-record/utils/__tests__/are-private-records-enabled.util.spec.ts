import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FeatureFlagKey } from 'twenty-shared/types';

import { arePrivateRecordsEnabled } from 'src/engine/permissions/internal/private-record/utils/are-private-records-enabled.util';

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

  it('should be on with the private records flag', () => {
    expect(
      arePrivateRecordsEnabled({
        flatObjectMetadata: ORDINARY_OBJECT,
        featureFlagsMap: { [FeatureFlagKey.IS_PRIVATE_RECORDS_ENABLED]: true },
      }),
    ).toBe(true);
  });

  it('should stay off when only record sharing is on', () => {
    expect(
      arePrivateRecordsEnabled({
        flatObjectMetadata: ORDINARY_OBJECT,
        featureFlagsMap: {
          [FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED]: true,
        },
      }),
    ).toBe(false);
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
