import { ObjectRecordDiff } from 'src/engine/core-modules/event-emitter/types/object-record-diff';
import { hasPrimaryEmailChanged } from 'src/modules/calendar/calendar-event-participant-manager/utils/has-primary-email-changed';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

describe('hasPrimaryEmailChanged', () => {
  it('should return true when primary email has changed', () => {
    const diff: Partial<ObjectRecordDiff<PersonWorkspaceEntity>> = {
      emails: {
        before: {
          primaryEmail: 'old@example.com',
          additionalEmails: [],
        },
        after: {
          primaryEmail: 'new@example.com',
          additionalEmails: [],
        },
      },
    };

    const result = hasPrimaryEmailChanged(diff);

    expect(result).toBe(true);
  });

  it('should return false when primary email has not changed', () => {
    const diff: Partial<ObjectRecordDiff<PersonWorkspaceEntity>> = {
      emails: {
        before: {
          primaryEmail: 'same@example.com',
          additionalEmails: ['additional@example.com'],
        },
        after: {
          primaryEmail: 'same@example.com',
          additionalEmails: ['different@example.com'],
        },
      },
    };

    const result = hasPrimaryEmailChanged(diff);

    expect(result).toBe(false);
  });

  it('should return true when primary email changes from null to a value', () => {
    const diff: Partial<ObjectRecordDiff<PersonWorkspaceEntity>> = {
      emails: {
        before: {
          primaryEmail: null as any,
          additionalEmails: [],
        },
        after: {
          primaryEmail: 'new@example.com',
          additionalEmails: [],
        },
      },
    };

    const result = hasPrimaryEmailChanged(diff);

    expect(result).toBe(true);
  });

  it('should return true when primary email changes from a value to null', () => {
    const diff: Partial<ObjectRecordDiff<PersonWorkspaceEntity>> = {
      emails: {
        before: {
          primaryEmail: 'old@example.com',
          additionalEmails: [],
        },
        after: {
          primaryEmail: null as any,
          additionalEmails: [],
        },
      },
    };

    const result = hasPrimaryEmailChanged(diff);

    expect(result).toBe(true);
  });

  it('should return false when both primary emails are null', () => {
    const diff: Partial<ObjectRecordDiff<PersonWorkspaceEntity>> = {
      emails: {
        before: {
          primaryEmail: null as any,
          additionalEmails: [],
        },
        after: {
          primaryEmail: null as any,
          additionalEmails: [],
        },
      },
    };

    const result = hasPrimaryEmailChanged(diff);

    expect(result).toBe(false);
  });

  it('should return true when primary email changes from undefined to a value', () => {
    const diff: Partial<ObjectRecordDiff<PersonWorkspaceEntity>> = {
      emails: {
        before: {
          primaryEmail: undefined as any,
          additionalEmails: [],
        },
        after: {
          primaryEmail: 'new@example.com',
          additionalEmails: [],
        },
      },
    };

    const result = hasPrimaryEmailChanged(diff);

    expect(result).toBe(true);
  });

  it('should return true when primary email changes from a value to undefined', () => {
    const diff: Partial<ObjectRecordDiff<PersonWorkspaceEntity>> = {
      emails: {
        before: {
          primaryEmail: 'old@example.com',
          additionalEmails: [],
        },
        after: {
          primaryEmail: undefined as any,
          additionalEmails: [],
        },
      },
    };

    const result = hasPrimaryEmailChanged(diff);

    expect(result).toBe(true);
  });

  it('should return false when both primary emails are undefined', () => {
    const diff: Partial<ObjectRecordDiff<PersonWorkspaceEntity>> = {
      emails: {
        before: {
          primaryEmail: undefined as any,
          additionalEmails: [],
        },
        after: {
          primaryEmail: undefined as any,
          additionalEmails: [],
        },
      },
    };

    const result = hasPrimaryEmailChanged(diff);

    expect(result).toBe(false);
  });

  it('should return true when primary email changes from empty string to a value', () => {
    const diff: Partial<ObjectRecordDiff<PersonWorkspaceEntity>> = {
      emails: {
        before: {
          primaryEmail: '',
          additionalEmails: [],
        },
        after: {
          primaryEmail: 'new@example.com',
          additionalEmails: [],
        },
      },
    };

    const result = hasPrimaryEmailChanged(diff);

    expect(result).toBe(true);
  });

  it('should return true when primary email changes from a value to empty string', () => {
    const diff: Partial<ObjectRecordDiff<PersonWorkspaceEntity>> = {
      emails: {
        before: {
          primaryEmail: 'old@example.com',
          additionalEmails: [],
        },
        after: {
          primaryEmail: '',
          additionalEmails: [],
        },
      },
    };

    const result = hasPrimaryEmailChanged(diff);

    expect(result).toBe(true);
  });

  it('should return false when both primary emails are empty strings', () => {
    const diff: Partial<ObjectRecordDiff<PersonWorkspaceEntity>> = {
      emails: {
        before: {
          primaryEmail: '',
          additionalEmails: [],
        },
        after: {
          primaryEmail: '',
          additionalEmails: [],
        },
      },
    };

    const result = hasPrimaryEmailChanged(diff);

    expect(result).toBe(false);
  });

  it('should handle case when emails diff is undefined', () => {
    const diff: Partial<ObjectRecordDiff<PersonWorkspaceEntity>> = {};

    const result = hasPrimaryEmailChanged(diff);

    expect(result).toBe(false);
  });

  it('should handle case when emails.before is undefined', () => {
    const diff: Partial<ObjectRecordDiff<PersonWorkspaceEntity>> = {
      emails: {
        before: undefined as any,
        after: {
          primaryEmail: 'new@example.com',
          additionalEmails: [],
        },
      },
    };

    const result = hasPrimaryEmailChanged(diff);

    expect(result).toBe(true);
  });

  it('should handle case when emails.after is undefined', () => {
    const diff: Partial<ObjectRecordDiff<PersonWorkspaceEntity>> = {
      emails: {
        before: {
          primaryEmail: 'old@example.com',
          additionalEmails: [],
        },
        after: undefined as any,
      },
    };

    const result = hasPrimaryEmailChanged(diff);

    expect(result).toBe(true);
  });

  it('should handle case when both emails.before and emails.after are undefined', () => {
    const diff: Partial<ObjectRecordDiff<PersonWorkspaceEntity>> = {
      emails: {
        before: undefined as any,
        after: undefined as any,
      },
    };

    const result = hasPrimaryEmailChanged(diff);

    expect(result).toBe(false);
  });

  it('should not be case sensitive when comparing emails', () => {
    const diff: Partial<ObjectRecordDiff<PersonWorkspaceEntity>> = {
      emails: {
        before: {
          primaryEmail: 'test@example.com',
          additionalEmails: [],
        },
        after: {
          primaryEmail: 'TEST@EXAMPLE.COM',
          additionalEmails: [],
        },
      },
    };

    const result = hasPrimaryEmailChanged(diff);

    expect(result).toBe(false);
  });
});
