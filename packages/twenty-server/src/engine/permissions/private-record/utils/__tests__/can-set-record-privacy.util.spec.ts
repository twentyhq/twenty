/* @license Enterprise */

import { FeatureFlagKey } from 'twenty-shared/types';

import { canSetRecordPrivacy } from 'src/engine/permissions/private-record/utils/can-set-record-privacy.util';

describe('canSetRecordPrivacy', () => {
  it.each([
    { featureFlagsMap: {}, expected: false },
    {
      featureFlagsMap: { [FeatureFlagKey.IS_PRIVATE_RECORDS_ENABLED]: true },
      expected: true,
    },
    {
      featureFlagsMap: {
        [FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED]: true,
      },
      expected: false,
    },
  ])(
    'should return $expected for flags $featureFlagsMap',
    ({ featureFlagsMap, expected }) => {
      expect(canSetRecordPrivacy({ featureFlagsMap })).toBe(expected);
    },
  );
});
