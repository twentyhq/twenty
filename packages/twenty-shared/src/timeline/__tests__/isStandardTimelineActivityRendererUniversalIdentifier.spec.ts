import {
  isStandardTimelineActivityRendererUniversalIdentifier,
  STANDARD_TIMELINE_ACTIVITY_RENDERER_UNIVERSAL_IDENTIFIERS,
} from '../StandardTimelineActivityRendererUniversalIdentifier';

describe('isStandardTimelineActivityRendererUniversalIdentifier', () => {
  it.each(
    Object.values(STANDARD_TIMELINE_ACTIVITY_RENDERER_UNIVERSAL_IDENTIFIERS),
  )('accepts %s', (universalIdentifier) => {
    expect(
      isStandardTimelineActivityRendererUniversalIdentifier(
        universalIdentifier,
      ),
    ).toBe(true);
  });

  it('rejects an unknown identifier', () => {
    expect(
      isStandardTimelineActivityRendererUniversalIdentifier(
        '00000000-0000-4000-8000-000000000001',
      ),
    ).toBe(false);
  });
});
