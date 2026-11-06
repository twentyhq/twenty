import { isAiContentRecordingAllowed } from '../is-ai-content-recording-allowed.util';

const NO_RESTRICTION = {
  requiredDataResidencyRegion: null,
  isZeroDataRetentionRequired: false,
  isProductImprovementDataSharingEnabled: true,
};

describe('isAiContentRecordingAllowed', () => {
  it('allows recording when sharing is on and nothing is restricted', () => {
    expect(isAiContentRecordingAllowed(NO_RESTRICTION)).toBe(true);
  });

  it('refuses recording when sharing is off', () => {
    expect(
      isAiContentRecordingAllowed({
        ...NO_RESTRICTION,
        isProductImprovementDataSharingEnabled: false,
      }),
    ).toBe(false);
  });

  it('refuses recording under a required region even with sharing on', () => {
    expect(
      isAiContentRecordingAllowed({
        ...NO_RESTRICTION,
        requiredDataResidencyRegion: 'eu',
      }),
    ).toBe(false);
  });

  it('refuses recording under zero data retention even with sharing on', () => {
    expect(
      isAiContentRecordingAllowed({
        ...NO_RESTRICTION,
        isZeroDataRetentionRequired: true,
      }),
    ).toBe(false);
  });
});
