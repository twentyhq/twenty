import { type EachTestingContext } from 'twenty-shared/testing';
import { type ObjectRecordDiff } from 'twenty-shared/database-events';

import { hasPrimaryEmailChanged } from 'src/modules/contact-creation-manager/utils/has-primary-email-changed';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

type HasPrimaryEmailChangedTestCase = EachTestingContext<{
  diff: Partial<ObjectRecordDiff<PersonWorkspaceEntity>>;
  expected: boolean;
}>;

const testCases: HasPrimaryEmailChangedTestCase[] = [
  {
    title: 'should return true when primary email has changed',
    context: {
      diff: {
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
      },
      expected: true,
    },
  },
  {
    title: 'should return false when primary email has not changed',
    context: {
      diff: {
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
      },
      expected: false,
    },
  },
  {
    title: 'should return true when primary email changes from null to a value',
    context: {
      diff: {
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
      },
      expected: true,
    },
  },
  {
    title: 'should return true when primary email changes from a value to null',
    context: {
      diff: {
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
      },
      expected: true,
    },
  },
  {
    title: 'should return false when both primary emails are null',
    context: {
      diff: {
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
      },
      expected: false,
    },
  },
  {
    title:
      'should return true when primary email changes from undefined to a value',
    context: {
      diff: {
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
      },
      expected: true,
    },
  },
  {
    title:
      'should return true when primary email changes from a value to undefined',
    context: {
      diff: {
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
      },
      expected: true,
    },
  },
  {
    title: 'should return false when both primary emails are undefined',
    context: {
      diff: {
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
      },
      expected: false,
    },
  },
  {
    title:
      'should return true when primary email changes from empty string to a value',
    context: {
      diff: {
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
      },
      expected: true,
    },
  },
  {
    title:
      'should return true when primary email changes from a value to empty string',
    context: {
      diff: {
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
      },
      expected: true,
    },
  },
  {
    title: 'should return false when both primary emails are empty strings',
    context: {
      diff: {
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
      },
      expected: false,
    },
  },
  {
    title: 'should handle case when emails diff is undefined',
    context: {
      diff: {},
      expected: false,
    },
  },
  {
    title: 'should handle case when emails.before is undefined',
    context: {
      diff: {
        emails: {
          before: undefined as any,
          after: {
            primaryEmail: 'new@example.com',
            additionalEmails: [],
          },
        },
      },
      expected: true,
    },
  },
  {
    title: 'should handle case when emails.after is undefined',
    context: {
      diff: {
        emails: {
          before: {
            primaryEmail: 'old@example.com',
            additionalEmails: [],
          },
          after: undefined as any,
        },
      },
      expected: true,
    },
  },
  {
    title:
      'should handle case when both emails.before and emails.after are undefined',
    context: {
      diff: {
        emails: {
          before: undefined as any,
          after: undefined as any,
        },
      },
      expected: false,
    },
  },
  {
    title: 'should not be case sensitive when comparing emails',
    context: {
      diff: {
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
      },
      expected: false,
    },
  },
];

describe('hasPrimaryEmailChanged', () => {
  test.each(testCases)('$title', ({ context: { diff, expected } }) => {
    const result = hasPrimaryEmailChanged(diff);

    expect(result).toBe(expected);
  });
});
