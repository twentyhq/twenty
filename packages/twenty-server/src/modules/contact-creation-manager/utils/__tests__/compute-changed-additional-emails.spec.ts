import { type EachTestingContext } from 'twenty-shared/testing';
import { type ObjectRecordDiff } from 'twenty-shared/database-events';

import { computeChangedAdditionalEmails } from 'src/modules/contact-creation-manager/utils/compute-changed-additional-emails';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

type ComputeChangedAdditionalEmailsTestCase = EachTestingContext<{
  diff: Partial<ObjectRecordDiff<PersonWorkspaceEntity>>;
  expected: {
    addedAdditionalEmails: string[];
    removedAdditionalEmails: string[];
  };
}>;

const testCases: ComputeChangedAdditionalEmailsTestCase[] = [
  {
    title:
      'should return added and removed emails when both before and after are valid arrays',
    context: {
      diff: {
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
      },
      expected: {
        addedAdditionalEmails: ['new1@example.com'],
        removedAdditionalEmails: ['old1@example.com'],
      },
    },
  },
  {
    title:
      'should return all emails as added when before is empty and after has emails',
    context: {
      diff: {
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
      },
      expected: {
        addedAdditionalEmails: ['new1@example.com', 'new2@example.com'],
        removedAdditionalEmails: [],
      },
    },
  },
  {
    title:
      'should return all emails as removed when before has emails and after is empty',
    context: {
      diff: {
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
      },
      expected: {
        addedAdditionalEmails: [],
        removedAdditionalEmails: ['old1@example.com', 'old2@example.com'],
      },
    },
  },
  {
    title: 'should return empty arrays when both before and after are empty',
    context: {
      diff: {
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
      },
      expected: {
        addedAdditionalEmails: [],
        removedAdditionalEmails: [],
      },
    },
  },
  {
    title:
      'should return empty arrays when both before and after have the same emails',
    context: {
      diff: {
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
      },
      expected: {
        addedAdditionalEmails: [],
        removedAdditionalEmails: [],
      },
    },
  },
  {
    title: 'should handle case when before additionalEmails is not an array',
    context: {
      diff: {
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
      },
      expected: {
        addedAdditionalEmails: [],
        removedAdditionalEmails: [],
      },
    },
  },
  {
    title: 'should handle case when after additionalEmails is not an array',
    context: {
      diff: {
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
      },
      expected: {
        addedAdditionalEmails: [],
        removedAdditionalEmails: [],
      },
    },
  },
  {
    title:
      'should handle case when both before and after additionalEmails are not arrays',
    context: {
      diff: {
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
      },
      expected: {
        addedAdditionalEmails: [],
        removedAdditionalEmails: [],
      },
    },
  },
  {
    title: 'should handle case when emails diff is undefined',
    context: {
      diff: {},
      expected: {
        addedAdditionalEmails: [],
        removedAdditionalEmails: [],
      },
    },
  },
  {
    title:
      'should handle complex scenario with multiple additions and removals',
    context: {
      diff: {
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
      },
      expected: {
        addedAdditionalEmails: ['add1@example.com', 'add2@example.com'],
        removedAdditionalEmails: ['remove1@example.com', 'remove2@example.com'],
      },
    },
  },
  {
    title: 'should not be case sensitive when comparing emails',
    context: {
      diff: {
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
      },
      expected: {
        addedAdditionalEmails: [],
        removedAdditionalEmails: [],
      },
    },
  },
];

describe('computeChangedAdditionalEmails', () => {
  test.each(testCases)('$title', ({ context: { diff, expected } }) => {
    const result = computeChangedAdditionalEmails(diff);

    expect(result).toEqual(expected);
  });
});
