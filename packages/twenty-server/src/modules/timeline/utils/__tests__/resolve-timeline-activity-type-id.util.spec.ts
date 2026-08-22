import {
  buildTimelineActivityTypeResolver,
  resolveTimelineActivityTypeIdOrThrow,
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

  it('rejects ambiguous shared types', () => {
    expect(() =>
      buildTimelineActivityTypeResolver({
        byUniversalIdentifier: {
          first: {
            id: SHARED_LINKED_ID,
            action: 'linked',
            objectUniversalIdentifier: null,
          },
          second: {
            id: NOTE_LINKED_ID,
            action: 'linked',
            objectUniversalIdentifier: null,
          },
        },
      }),
    ).toThrow('Multiple timeline activity types resolve shared action linked');
  });

  it('rejects ambiguous object-bound types', () => {
    expect(() =>
      buildTimelineActivityTypeResolver({
        byUniversalIdentifier: {
          first: {
            id: SHARED_LINKED_ID,
            action: 'linked',
            objectUniversalIdentifier: NOTE_UNIVERSAL_IDENTIFIER,
          },
          second: {
            id: NOTE_LINKED_ID,
            action: 'linked',
            objectUniversalIdentifier: NOTE_UNIVERSAL_IDENTIFIER,
          },
        },
      }),
    ).toThrow(
      `Multiple timeline activity types resolve action linked for object ${NOTE_UNIVERSAL_IDENTIFIER}`,
    );
  });
});

describe('resolveTimelineActivityTypeIdOrThrow', () => {
  const resolveTimelineActivityTypeId = buildTimelineActivityTypeResolver(
    flatTimelineActivityTypeMaps,
  );

  it('returns the resolved type id', () => {
    expect(
      resolveTimelineActivityTypeIdOrThrow({
        resolveTimelineActivityTypeId,
        workspaceId: 'workspace-id',
        action: 'linked',
        objectUniversalIdentifier: NOTE_UNIVERSAL_IDENTIFIER,
      }),
    ).toBe(NOTE_LINKED_ID);
  });

  it('throws when the workspace has no type for the event', () => {
    expect(() =>
      resolveTimelineActivityTypeIdOrThrow({
        resolveTimelineActivityTypeId,
        workspaceId: 'workspace-id',
        action: 'deleted',
        objectUniversalIdentifier: NOTE_UNIVERSAL_IDENTIFIER,
      }),
    ).toThrow(
      `No timeline activity type resolves action deleted for object ${NOTE_UNIVERSAL_IDENTIFIER} in workspace workspace-id`,
    );
  });
});
