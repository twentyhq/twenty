import {
  buildTimelineActivityTypeResolver,
  type TimelineActivityTypeResolutionMaps,
} from 'src/modules/timeline/utils/resolve-timeline-activity-type-id.util';

const SHARED_LINKED_ID = '00000000-0000-4000-8000-000000000001';
const NOTE_LINKED_ID = '00000000-0000-4000-8000-000000000002';
const NOTE_UPDATED_ID = '00000000-0000-4000-8000-000000000003';
const NOTE_UNIVERSAL_IDENTIFIER = '00000000-0000-4000-8000-000000000010';
const OTHER_UNIVERSAL_IDENTIFIER = '00000000-0000-4000-8000-000000000011';

const flatTimelineActivityTypeMaps: TimelineActivityTypeResolutionMaps = {
  byUniversalIdentifier: {
    recordLinked: {
      id: SHARED_LINKED_ID,
      action: 'linked',
      objectUniversalIdentifier: null,
    },
    noteLinked: {
      id: NOTE_LINKED_ID,
      action: 'linked',
      objectUniversalIdentifier: NOTE_UNIVERSAL_IDENTIFIER,
    },
    noteUpdated: {
      id: NOTE_UPDATED_ID,
      action: 'updated',
      objectUniversalIdentifier: NOTE_UNIVERSAL_IDENTIFIER,
    },
    note: {
      id: '00000000-0000-4000-8000-000000000004',
      action: null,
      objectUniversalIdentifier: null,
    },
  },
};

describe('buildTimelineActivityTypeResolver', () => {
  const resolve = buildTimelineActivityTypeResolver(
    flatTimelineActivityTypeMaps,
  );

  it('prefers the type bound to the object over the shared one', () => {
    expect(
      resolve({
        action: 'linked',
        objectUniversalIdentifier: NOTE_UNIVERSAL_IDENTIFIER,
      }),
    ).toBe(NOTE_LINKED_ID);
  });

  it('falls back to the shared type when the object has none for that action', () => {
    expect(
      resolve({
        action: 'linked',
        objectUniversalIdentifier: OTHER_UNIVERSAL_IDENTIFIER,
      }),
    ).toBe(SHARED_LINKED_ID);
  });

  it('uses the shared type when no object is given', () => {
    expect(resolve({ action: 'linked' })).toBe(SHARED_LINKED_ID);
  });

  it('returns undefined when nothing covers the action', () => {
    expect(resolve({ action: 'deleted' })).toBeUndefined();
  });

  it('resolves an object-bound type for a non-link action', () => {
    expect(
      resolve({
        action: 'updated',
        objectUniversalIdentifier: NOTE_UNIVERSAL_IDENTIFIER,
      }),
    ).toBe(NOTE_UPDATED_ID);
  });
});
