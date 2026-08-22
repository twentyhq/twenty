import {
  buildResolvedTimelineActivityTypeResolver,
  resolveTimelineActivityTypeOrThrow,
  type TimelineActivityTypeResolutionMaps,
} from 'src/modules/timeline/utils/resolve-timeline-activity-type.util';

const SHARED_LINKED_ID = '00000000-0000-4000-8000-000000000001';
const NOTE_LINKED_ID = '00000000-0000-4000-8000-000000000002';
const NOTE_UNIVERSAL_IDENTIFIER = '00000000-0000-4000-8000-000000000010';
const FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  '00000000-0000-4000-8000-000000000020';
const APPLICATION_ID = '00000000-0000-4000-8000-000000000030';

const noteLinkedTimelineActivityType = {
  id: NOTE_LINKED_ID,
  applicationId: APPLICATION_ID,
  universalIdentifier: '00000000-0000-4000-8000-000000000102',
  name: 'note.linked',
  label: 'Linked a note',
  action: 'linked' as const,
  icon: 'IconNotes',
  objectUniversalIdentifier: NOTE_UNIVERSAL_IDENTIFIER,
  targetRelationFieldUniversalIdentifier: null,
  frontComponentUniversalIdentifier: FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
};

const flatTimelineActivityTypeMaps: TimelineActivityTypeResolutionMaps = {
  byUniversalIdentifier: {
    recordLinked: {
      id: SHARED_LINKED_ID,
      applicationId: APPLICATION_ID,
      universalIdentifier: '00000000-0000-4000-8000-000000000101',
      name: 'record.linked',
      label: 'Linked a record',
      action: 'linked',
      icon: 'IconLink',
      objectUniversalIdentifier: null,
      targetRelationFieldUniversalIdentifier: null,
      frontComponentUniversalIdentifier: null,
    },
    noteLinked: noteLinkedTimelineActivityType,
  },
};

describe('buildResolvedTimelineActivityTypeResolver', () => {
  const resolveTimelineActivityType = buildResolvedTimelineActivityTypeResolver(
    flatTimelineActivityTypeMaps,
  );

  it('returns the object-bound type and its immutable render snapshot', () => {
    expect(
      resolveTimelineActivityType({
        action: 'linked',
        objectUniversalIdentifier: NOTE_UNIVERSAL_IDENTIFIER,
      }),
    ).toEqual({
      id: NOTE_LINKED_ID,
      applicationId: APPLICATION_ID,
      snapshot: {
        id: NOTE_LINKED_ID,
        universalIdentifier: '00000000-0000-4000-8000-000000000102',
        name: 'note.linked',
        label: 'Linked a note',
        action: 'linked',
        icon: 'IconNotes',
        objectUniversalIdentifier: NOTE_UNIVERSAL_IDENTIFIER,
        frontComponentUniversalIdentifier: FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
      },
    });
  });

  it('falls back to a shared type', () => {
    expect(
      resolveTimelineActivityType({
        action: 'linked',
        objectUniversalIdentifier: '00000000-0000-4000-8000-000000000099',
      })?.id,
    ).toBe(SHARED_LINKED_ID);
  });

  it('does not treat a routed type as a source record resolver', () => {
    const resolver = buildResolvedTimelineActivityTypeResolver({
      byUniversalIdentifier: {
        ...flatTimelineActivityTypeMaps.byUniversalIdentifier,
        routedNoteLinked: {
          ...noteLinkedTimelineActivityType,
          id: '00000000-0000-4000-8000-000000000004',
          universalIdentifier: '00000000-0000-4000-8000-000000000104',
          targetRelationFieldUniversalIdentifier:
            '00000000-0000-4000-8000-000000000105',
        },
      },
    });

    expect(
      resolver({
        action: 'linked',
        objectUniversalIdentifier: NOTE_UNIVERSAL_IDENTIFIER,
      })?.id,
    ).toBe(NOTE_LINKED_ID);
  });

  it('rejects ambiguous types before any row can be stamped', () => {
    expect(() =>
      buildResolvedTimelineActivityTypeResolver({
        byUniversalIdentifier: {
          ...flatTimelineActivityTypeMaps.byUniversalIdentifier,
          duplicate: {
            ...noteLinkedTimelineActivityType,
            id: '00000000-0000-4000-8000-000000000003',
            universalIdentifier: '00000000-0000-4000-8000-000000000103',
          },
        },
      }),
    ).toThrow(
      `Multiple timeline activity types resolve action linked for object ${NOTE_UNIVERSAL_IDENTIFIER}`,
    );
  });
});

describe('resolveTimelineActivityTypeOrThrow', () => {
  const resolveTimelineActivityType = buildResolvedTimelineActivityTypeResolver(
    flatTimelineActivityTypeMaps,
  );

  it('throws with the missing event context', () => {
    expect(() =>
      resolveTimelineActivityTypeOrThrow({
        resolveTimelineActivityType,
        workspaceId: 'workspace-id',
        action: 'deleted',
        objectUniversalIdentifier: NOTE_UNIVERSAL_IDENTIFIER,
      }),
    ).toThrow(
      `No timeline activity type resolves action deleted for object ${NOTE_UNIVERSAL_IDENTIFIER} in workspace workspace-id`,
    );
  });
});
