import { ObjectRecordDiff } from 'src/engine/core-modules/event-emitter/types/object-record-diff';
import { computeChangedAdditionalEmails } from 'src/modules/contact-creation-manager/utils/compute-changed-additional-emails';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

describe('computeChangedAdditionalEmails', () => {
  it('should return added and removed emails when both before and after are valid arrays', () => {
    const diff: Partial<ObjectRecordDiff<PersonWorkspaceEntity>> = {
      emails: {
        before: {
          primaryEmail: 'primary@example.com',
          additionalEmails: ['old1@example.com', 'common@example.com'],
        },
        after: {
          primaryEmail: 'primary@example.com',
          additionalEmails: ['new1@example.com', 'common@example.com'],
        },
      },
    };

    const result = computeChangedAdditionalEmails(diff);

    expect(result).toEqual({
      addedAdditionalEmails: ['new1@example.com'],
      removedAdditionalEmails: ['old1@example.com'],
    });
  });

  it('should return all emails as added when before is empty and after has emails', () => {
    const diff: Partial<ObjectRecordDiff<PersonWorkspaceEntity>> = {
      emails: {
        before: {
          primaryEmail: 'primary@example.com',
          additionalEmails: [],
        },
        after: {
          primaryEmail: 'primary@example.com',
          additionalEmails: ['new1@example.com', 'new2@example.com'],
        },
      },
    };

    const result = computeChangedAdditionalEmails(diff);

    expect(result).toEqual({
      addedAdditionalEmails: ['new1@example.com', 'new2@example.com'],
      removedAdditionalEmails: [],
    });
  });

  it('should return all emails as removed when before has emails and after is empty', () => {
    const diff: Partial<ObjectRecordDiff<PersonWorkspaceEntity>> = {
      emails: {
        before: {
          primaryEmail: 'primary@example.com',
          additionalEmails: ['old1@example.com', 'old2@example.com'],
        },
        after: {
          primaryEmail: 'primary@example.com',
          additionalEmails: [],
        },
      },
    };

    const result = computeChangedAdditionalEmails(diff);

    expect(result).toEqual({
      addedAdditionalEmails: [],
      removedAdditionalEmails: ['old1@example.com', 'old2@example.com'],
    });
  });

  it('should return empty arrays when both before and after are empty', () => {
    const diff: Partial<ObjectRecordDiff<PersonWorkspaceEntity>> = {
      emails: {
        before: {
          primaryEmail: 'primary@example.com',
          additionalEmails: [],
        },
        after: {
          primaryEmail: 'primary@example.com',
          additionalEmails: [],
        },
      },
    };

    const result = computeChangedAdditionalEmails(diff);

    expect(result).toEqual({
      addedAdditionalEmails: [],
      removedAdditionalEmails: [],
    });
  });

  it('should return empty arrays when both before and after have the same emails', () => {
    const diff: Partial<ObjectRecordDiff<PersonWorkspaceEntity>> = {
      emails: {
        before: {
          primaryEmail: 'primary@example.com',
          additionalEmails: ['email1@example.com', 'email2@example.com'],
        },
        after: {
          primaryEmail: 'primary@example.com',
          additionalEmails: ['email1@example.com', 'email2@example.com'],
        },
      },
    };

    const result = computeChangedAdditionalEmails(diff);

    expect(result).toEqual({
      addedAdditionalEmails: [],
      removedAdditionalEmails: [],
    });
  });

  it('should handle case when before additionalEmails is not an array', () => {
    const diff: Partial<ObjectRecordDiff<PersonWorkspaceEntity>> = {
      emails: {
        before: {
          primaryEmail: 'primary@example.com',
          additionalEmails: null as any,
        },
        after: {
          primaryEmail: 'primary@example.com',
          additionalEmails: ['new@example.com'],
        },
      },
    };

    const result = computeChangedAdditionalEmails(diff);

    expect(result).toEqual({
      addedAdditionalEmails: [],
      removedAdditionalEmails: [],
    });
  });

  it('should handle case when after additionalEmails is not an array', () => {
    const diff: Partial<ObjectRecordDiff<PersonWorkspaceEntity>> = {
      emails: {
        before: {
          primaryEmail: 'primary@example.com',
          additionalEmails: ['old@example.com'],
        },
        after: {
          primaryEmail: 'primary@example.com',
          additionalEmails: null as any,
        },
      },
    };

    const result = computeChangedAdditionalEmails(diff);

    expect(result).toEqual({
      addedAdditionalEmails: [],
      removedAdditionalEmails: [],
    });
  });

  it('should handle case when both before and after additionalEmails are not arrays', () => {
    const diff: Partial<ObjectRecordDiff<PersonWorkspaceEntity>> = {
      emails: {
        before: {
          primaryEmail: 'primary@example.com',
          additionalEmails: null as any,
        },
        after: {
          primaryEmail: 'primary@example.com',
          additionalEmails: undefined as any,
        },
      },
    };

    const result = computeChangedAdditionalEmails(diff);

    expect(result).toEqual({
      addedAdditionalEmails: [],
      removedAdditionalEmails: [],
    });
  });

  it('should handle case when emails diff is undefined', () => {
    const diff: Partial<ObjectRecordDiff<PersonWorkspaceEntity>> = {};

    const result = computeChangedAdditionalEmails(diff);

    expect(result).toEqual({
      addedAdditionalEmails: [],
      removedAdditionalEmails: [],
    });
  });

  it('should handle complex scenario with multiple additions and removals', () => {
    const diff: Partial<ObjectRecordDiff<PersonWorkspaceEntity>> = {
      emails: {
        before: {
          primaryEmail: 'primary@example.com',
          additionalEmails: [
            'keep1@example.com',
            'remove1@example.com',
            'keep2@example.com',
            'remove2@example.com',
          ],
        },
        after: {
          primaryEmail: 'primary@example.com',
          additionalEmails: [
            'keep1@example.com',
            'add1@example.com',
            'keep2@example.com',
            'add2@example.com',
          ],
        },
      },
    };

    const result = computeChangedAdditionalEmails(diff);

    expect(result).toEqual({
      addedAdditionalEmails: ['add1@example.com', 'add2@example.com'],
      removedAdditionalEmails: ['remove1@example.com', 'remove2@example.com'],
    });
  });

  it('should not be case sensitive when comparing emails', () => {
    const diff: Partial<ObjectRecordDiff<PersonWorkspaceEntity>> = {
      emails: {
        before: {
          primaryEmail: 'primary@example.com',
          additionalEmails: ['old@example.com'],
        },
        after: {
          primaryEmail: 'primary@example.com',
          additionalEmails: ['OLD@example.com'],
        },
      },
    };

    const result = computeChangedAdditionalEmails(diff);

    expect(result).toEqual({
      addedAdditionalEmails: [],
      removedAdditionalEmails: [],
    });
  });
});
