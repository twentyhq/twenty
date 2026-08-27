import {
  buildTimelineActivityTypeResolution,
  type TimelineActivityTypeResolutionMaps,
} from 'src/modules/timeline/utils/resolve-timeline-activity-type.util';

const SHARED_LINKED_ID = '00000000-0000-4000-8000-000000000001';
const NOTE_LINKED_ID = '00000000-0000-4000-8000-000000000002';
const NOTE_UNIVERSAL_IDENTIFIER = '00000000-0000-4000-8000-000000000010';
const NOTE_TARGETS_UNIVERSAL_IDENTIFIER =
  '00000000-0000-4000-8000-000000000105';
const FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  '00000000-0000-4000-8000-000000000020';
const APPLICATION_ID = '00000000-0000-4000-8000-000000000030';
const APPLICATION_UNIVERSAL_IDENTIFIER = '00000000-0000-4000-8000-000000000031';

const noteLinkedTimelineActivityType = {
  id: NOTE_LINKED_ID,
  applicationId: APPLICATION_ID,
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  universalIdentifier: '00000000-0000-4000-8000-000000000102',
  name: 'note.linked',
  label: 'Linked a note',
  action: 'linked' as const,
  icon: 'IconNotes',
  objectUniversalIdentifier: NOTE_UNIVERSAL_IDENTIFIER,
  targetRelationFieldUniversalIdentifier: null,
  triggerFieldUniversalIdentifiers: null,
  frontComponentUniversalIdentifier: FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  replacesTimelineActivityTypeUniversalIdentifier: null,
  isActive: true,
  overrides: null,
};

const flatTimelineActivityTypeMaps: TimelineActivityTypeResolutionMaps = {
  byUniversalIdentifier: {
    recordLinked: {
      id: SHARED_LINKED_ID,
      applicationId: APPLICATION_ID,
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      universalIdentifier: '00000000-0000-4000-8000-000000000101',
      name: 'record.linked',
      label: 'Linked a record',
      action: 'linked',
      icon: 'IconLink',
      objectUniversalIdentifier: null,
      targetRelationFieldUniversalIdentifier: null,
      triggerFieldUniversalIdentifiers: null,
      frontComponentUniversalIdentifier: null,
      replacesTimelineActivityTypeUniversalIdentifier: null,
      isActive: true,
      overrides: null,
    },
    noteLinked: noteLinkedTimelineActivityType,
  },
  objectMetadataByUniversalIdentifier: {
    [NOTE_UNIVERSAL_IDENTIFIER]: {
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    },
  },
};

describe('buildTimelineActivityTypeResolution', () => {
  const { resolveTimelineActivityType } = buildTimelineActivityTypeResolution(
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

  it('does not fall back when the matching object type is inactive', () => {
    const { resolveTimelineActivityType: resolver } =
      buildTimelineActivityTypeResolution({
        ...flatTimelineActivityTypeMaps,
        byUniversalIdentifier: {
          ...flatTimelineActivityTypeMaps.byUniversalIdentifier,
          noteLinked: {
            ...noteLinkedTimelineActivityType,
            isActive: false,
          },
        },
      });

    expect(
      resolver({
        action: 'linked',
        objectUniversalIdentifier: NOTE_UNIVERSAL_IDENTIFIER,
      }),
    ).toBeUndefined();
  });

  it('stores workspace presentation overrides in the durable snapshot', () => {
    const { resolveTimelineActivityType: resolver } =
      buildTimelineActivityTypeResolution({
        ...flatTimelineActivityTypeMaps,
        byUniversalIdentifier: {
          ...flatTimelineActivityTypeMaps.byUniversalIdentifier,
          noteLinked: {
            ...noteLinkedTimelineActivityType,
            overrides: {
              label: 'Added a note',
              icon: 'IconPencil',
            },
          },
        },
      });

    expect(
      resolver({
        action: 'linked',
        objectUniversalIdentifier: NOTE_UNIVERSAL_IDENTIFIER,
      })?.snapshot,
    ).toMatchObject({ label: 'Added a note', icon: 'IconPencil' });
  });

  it('does not treat a routed type as a source record resolver', () => {
    const {
      resolveTimelineActivityType: resolver,
      effectiveTimelineActivityTypes,
    } = buildTimelineActivityTypeResolution({
      objectMetadataByUniversalIdentifier:
        flatTimelineActivityTypeMaps.objectMetadataByUniversalIdentifier,
      byUniversalIdentifier: {
        ...flatTimelineActivityTypeMaps.byUniversalIdentifier,
        routedNoteLinked: {
          ...noteLinkedTimelineActivityType,
          id: '00000000-0000-4000-8000-000000000004',
          universalIdentifier: '00000000-0000-4000-8000-000000000104',
          targetRelationFieldUniversalIdentifier:
            NOTE_TARGETS_UNIVERSAL_IDENTIFIER,
        },
      },
    });

    expect(
      resolver({
        action: 'linked',
        objectUniversalIdentifier: NOTE_UNIVERSAL_IDENTIFIER,
      })?.id,
    ).toBe(NOTE_LINKED_ID);
    expect(effectiveTimelineActivityTypes.map(({ id }) => id)).toContain(
      '00000000-0000-4000-8000-000000000004',
    );
  });

  it('isolates a routed emit conflict from the source record resolver', () => {
    const routedTimelineActivityType = {
      ...noteLinkedTimelineActivityType,
      id: '00000000-0000-4000-8000-000000000004',
      universalIdentifier: '00000000-0000-4000-8000-000000000104',
      targetRelationFieldUniversalIdentifier: NOTE_TARGETS_UNIVERSAL_IDENTIFIER,
    };
    const {
      resolveTimelineActivityType: resolver,
      routingConflicts,
      effectiveTimelineActivityTypes,
    } = buildTimelineActivityTypeResolution({
      objectMetadataByUniversalIdentifier:
        flatTimelineActivityTypeMaps.objectMetadataByUniversalIdentifier,
      byUniversalIdentifier: {
        ...flatTimelineActivityTypeMaps.byUniversalIdentifier,
        routed: routedTimelineActivityType,
        duplicateRouted: {
          ...routedTimelineActivityType,
          id: '00000000-0000-4000-8000-000000000005',
          universalIdentifier: '00000000-0000-4000-8000-000000000106',
        },
      },
    });

    expect(routingConflicts).toEqual([
      {
        action: 'linked',
        objectUniversalIdentifier: NOTE_UNIVERSAL_IDENTIFIER,
      },
    ]);
    expect(effectiveTimelineActivityTypes.map(({ id }) => id)).not.toContain(
      routedTimelineActivityType.id,
    );
    expect(
      resolver({
        action: 'linked',
        objectUniversalIdentifier: NOTE_UNIVERSAL_IDENTIFIER,
      })?.id,
    ).toBe(NOTE_LINKED_ID);
  });

  it('isolates an ambiguous object contract without falling back', () => {
    const {
      resolveTimelineActivityType: resolver,
      routingConflicts,
      resolverConflicts,
    } = buildTimelineActivityTypeResolution({
      objectMetadataByUniversalIdentifier:
        flatTimelineActivityTypeMaps.objectMetadataByUniversalIdentifier,
      byUniversalIdentifier: {
        ...flatTimelineActivityTypeMaps.byUniversalIdentifier,
        duplicate: {
          ...noteLinkedTimelineActivityType,
          id: '00000000-0000-4000-8000-000000000003',
          universalIdentifier: '00000000-0000-4000-8000-000000000103',
        },
      },
    });

    expect(
      resolver({
        action: 'linked',
        objectUniversalIdentifier: NOTE_UNIVERSAL_IDENTIFIER,
      }),
    ).toBeUndefined();
    expect(
      resolver({
        action: 'linked',
        objectUniversalIdentifier: '00000000-0000-4000-8000-000000000099',
      })?.id,
    ).toBe(SHARED_LINKED_ID);
    expect(resolverConflicts).toEqual([
      {
        action: 'linked',
        objectUniversalIdentifier: NOTE_UNIVERSAL_IDENTIFIER,
      },
    ]);
    expect(routingConflicts).toEqual([]);
  });

  it('selects an explicit override deterministically', () => {
    const overrideUniversalIdentifier = '00000000-0000-4000-8000-000000000103';
    const { resolveTimelineActivityType: resolver, resolverConflicts } =
      buildTimelineActivityTypeResolution({
        objectMetadataByUniversalIdentifier:
          flatTimelineActivityTypeMaps.objectMetadataByUniversalIdentifier,
        byUniversalIdentifier: {
          ...flatTimelineActivityTypeMaps.byUniversalIdentifier,
          override: {
            ...noteLinkedTimelineActivityType,
            id: '00000000-0000-4000-8000-000000000003',
            applicationUniversalIdentifier:
              '00000000-0000-4000-8000-000000000032',
            universalIdentifier: overrideUniversalIdentifier,
            replacesTimelineActivityTypeUniversalIdentifier:
              noteLinkedTimelineActivityType.universalIdentifier,
          },
        },
      });

    expect(
      resolver({
        action: 'linked',
        objectUniversalIdentifier: NOTE_UNIVERSAL_IDENTIFIER,
      })?.snapshot.universalIdentifier,
    ).toBe(overrideUniversalIdentifier);
    expect(resolverConflicts).toEqual([]);
  });

  it('ignores and reports an implicit foreign-object takeover', () => {
    const { resolveTimelineActivityType: resolver, invalidContracts } =
      buildTimelineActivityTypeResolution({
        objectMetadataByUniversalIdentifier:
          flatTimelineActivityTypeMaps.objectMetadataByUniversalIdentifier,
        byUniversalIdentifier: {
          ...flatTimelineActivityTypeMaps.byUniversalIdentifier,
          takeover: {
            ...noteLinkedTimelineActivityType,
            id: '00000000-0000-4000-8000-000000000005',
            applicationUniversalIdentifier:
              '00000000-0000-4000-8000-000000000032',
            universalIdentifier: '00000000-0000-4000-8000-000000000105',
          },
        },
      });

    expect(
      resolver({
        action: 'linked',
        objectUniversalIdentifier: NOTE_UNIVERSAL_IDENTIFIER,
      })?.id,
    ).toBe(NOTE_LINKED_ID);
    expect(invalidContracts).toEqual([
      {
        action: 'linked',
        objectUniversalIdentifier: NOTE_UNIVERSAL_IDENTIFIER,
      },
    ]);
  });
});
