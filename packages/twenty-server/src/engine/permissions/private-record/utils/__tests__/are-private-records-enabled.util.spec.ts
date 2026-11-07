import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FeatureFlagKey } from 'twenty-shared/types';

import { arePrivateRecordsEnabled } from 'src/engine/permissions/private-record/utils/are-private-records-enabled.util';
import { PRIVATE_BY_DEFAULT_OBJECT_UNIVERSAL_IDENTIFIERS } from 'src/engine/permissions/internal/private-record/constants/private-by-default-object-universal-identifiers.constant';

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

  it('should stay on for a private by default object', () => {
    expect(
      arePrivateRecordsEnabled({
        flatObjectMetadata: {
          universalIdentifier:
            PRIVATE_BY_DEFAULT_OBJECT_UNIVERSAL_IDENTIFIERS[0],
        },
        featureFlagsMap: {},
      }),
    ).toBe(true);
  });
});
