import { isValidTimelineActivityTypeOverride } from 'src/engine/metadata-modules/timeline-activity-type/utils/is-valid-timeline-activity-type-override.util';

const CORE_APPLICATION = '00000000-0000-4000-8000-000000000001';
const THIRD_PARTY_APPLICATION = '00000000-0000-4000-8000-000000000002';
const COMPANY = '00000000-0000-4000-8000-000000000003';
const CORE_RECORD_CREATED = '00000000-0000-4000-8000-000000000004';

const coreRecordCreated = {
  action: 'created',
  applicationUniversalIdentifier: CORE_APPLICATION,
  objectUniversalIdentifier: null,
  targetRelationFieldUniversalIdentifier: null,
  triggerFieldUniversalIdentifiers: null,
  replacesTimelineActivityTypeUniversalIdentifier: null,
};

const thirdPartyCompanyCreated = {
  action: 'created',
  applicationUniversalIdentifier: THIRD_PARTY_APPLICATION,
  objectUniversalIdentifier: COMPANY,
  targetRelationFieldUniversalIdentifier: null,
  triggerFieldUniversalIdentifiers: null,
  replacesTimelineActivityTypeUniversalIdentifier: CORE_RECORD_CREATED,
};

describe('isValidTimelineActivityTypeOverride', () => {
  it('allows an application to bind timeline types to its own objects', () => {
    expect(
      isValidTimelineActivityTypeOverride({
        timelineActivityType: {
          ...thirdPartyCompanyCreated,
          replacesTimelineActivityTypeUniversalIdentifier: null,
        },
        objectOwner: {
          applicationUniversalIdentifier: THIRD_PARTY_APPLICATION,
        },
        overriddenTimelineActivityType: undefined,
      }),
    ).toBe(true);
  });

  it('rejects an implicit takeover of another application object', () => {
    expect(
      isValidTimelineActivityTypeOverride({
        timelineActivityType: {
          ...thirdPartyCompanyCreated,
          replacesTimelineActivityTypeUniversalIdentifier: null,
        },
        objectOwner: { applicationUniversalIdentifier: CORE_APPLICATION },
        overriddenTimelineActivityType: undefined,
      }),
    ).toBe(false);
  });

  it('allows explicit domain events on another application object', () => {
    expect(
      isValidTimelineActivityTypeOverride({
        timelineActivityType: {
          ...thirdPartyCompanyCreated,
          action: null,
          replacesTimelineActivityTypeUniversalIdentifier: null,
        },
        objectOwner: { applicationUniversalIdentifier: CORE_APPLICATION },
        overriddenTimelineActivityType: undefined,
      }),
    ).toBe(true);
  });

  it('allows an explicit compatible override', () => {
    expect(
      isValidTimelineActivityTypeOverride({
        timelineActivityType: thirdPartyCompanyCreated,
        objectOwner: { applicationUniversalIdentifier: CORE_APPLICATION },
        overriddenTimelineActivityType: coreRecordCreated,
      }),
    ).toBe(true);
  });

  it('rejects an override that changes the event semantics', () => {
    expect(
      isValidTimelineActivityTypeOverride({
        timelineActivityType: {
          ...thirdPartyCompanyCreated,
          action: 'deleted',
        },
        objectOwner: { applicationUniversalIdentifier: CORE_APPLICATION },
        overriddenTimelineActivityType: coreRecordCreated,
      }),
    ).toBe(false);
  });

  it('rejects an override that changes the trigger fields', () => {
    expect(
      isValidTimelineActivityTypeOverride({
        timelineActivityType: {
          ...thirdPartyCompanyCreated,
          triggerFieldUniversalIdentifiers: [COMPANY],
        },
        objectOwner: { applicationUniversalIdentifier: CORE_APPLICATION },
        overriddenTimelineActivityType: coreRecordCreated,
      }),
    ).toBe(false);
  });

  it('revokes the override when its base type disappears', () => {
    expect(
      isValidTimelineActivityTypeOverride({
        timelineActivityType: thirdPartyCompanyCreated,
        objectOwner: { applicationUniversalIdentifier: CORE_APPLICATION },
        overriddenTimelineActivityType: undefined,
      }),
    ).toBe(false);
  });
});
