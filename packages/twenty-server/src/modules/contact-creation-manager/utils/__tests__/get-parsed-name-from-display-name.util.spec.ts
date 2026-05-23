import { type EachTestingContext } from 'twenty-shared/testing';

import { getParsedNameFromDisplayName } from 'src/modules/contact-creation-manager/utils/get-parsed-name-from-display-name.util';

type TestCase = EachTestingContext<{
  displayName: string;
  expected: { firstName: string; lastName: string };
}>;

describe('getParsedNameFromDisplayName', () => {
  describe('common shapes', () => {
    const testCases: TestCase[] = [
      {
        title: 'should split a standard "First Last" display name',
        context: {
          displayName: 'John Doe',
          expected: { firstName: 'John', lastName: 'Doe' },
        },
      },
      {
        title: 'should keep all trailing tokens together as a multi-word last name',
        context: {
          displayName: 'Mary Jane Watson',
          expected: { firstName: 'Mary', lastName: 'Jane Watson' },
        },
      },
      {
        title: 'should treat a single-word display name as the first name only',
        context: {
          displayName: 'Cher',
          expected: { firstName: 'Cher', lastName: '' },
        },
      },
      {
        title: 'should collapse surrounding and inner whitespace',
        context: {
          displayName: '  John   Doe  ',
          expected: { firstName: 'John', lastName: 'Doe' },
        },
      },
    ];

    test.each(testCases)('$title', ({ context: { displayName, expected } }) => {
      expect(getParsedNameFromDisplayName(displayName)).toEqual(expected);
    });
  });

  describe('comma-inverted form "Last, First"', () => {
    const testCases: TestCase[] = [
      {
        title: 'should swap the two halves into first and last name',
        context: {
          displayName: 'Doe, John',
          expected: { firstName: 'John', lastName: 'Doe' },
        },
      },
      {
        title:
          'should strip surrounding RFC 5322 quoted-string quotes before swapping',
        context: {
          displayName: '"Doe, John"',
          expected: { firstName: 'John', lastName: 'Doe' },
        },
      },
    ];

    test.each(testCases)('$title', ({ context: { displayName, expected } }) => {
      expect(getParsedNameFromDisplayName(displayName)).toEqual(expected);
    });
  });

  describe('email-derived display names', () => {
    const testCases: TestCase[] = [
      {
        title:
          'should split a single dotted token like an email local part',
        context: {
          displayName: 'john.doe',
          expected: { firstName: 'john', lastName: 'doe' },
        },
      },
      {
        title:
          'should de-duplicate "First.Last Last" forms synthesized by some clients',
        context: {
          displayName: 'John.Doe Doe',
          expected: { firstName: 'John', lastName: 'Doe' },
        },
      },
      {
        title:
          'should expand "First.Middle Last" forms into a multi-word last name',
        context: {
          displayName: 'John.Doe Smith',
          expected: { firstName: 'John', lastName: 'Doe Smith' },
        },
      },
    ];

    test.each(testCases)('$title', ({ context: { displayName, expected } }) => {
      expect(getParsedNameFromDisplayName(displayName)).toEqual(expected);
    });
  });

  describe('mail-server ":GROUP" tag suffix', () => {
    const testCases: TestCase[] = [
      {
        title: 'should strip the tag from the first name in the comma-inverted form',
        context: {
          displayName: 'Smith, Jane:GROUP',
          expected: { firstName: 'Jane', lastName: 'Smith' },
        },
      },
      {
        title:
          'should strip the tag from the first token in a space-separated form',
        context: {
          displayName: 'Jane:GROUP Smith',
          expected: { firstName: 'Jane', lastName: 'Smith' },
        },
      },
    ];

    test.each(testCases)('$title', ({ context: { displayName, expected } }) => {
      expect(getParsedNameFromDisplayName(displayName)).toEqual(expected);
    });
  });

  describe('fallback cases (empty result)', () => {
    const testCases: TestCase[] = [
      {
        title:
          'should return empty names so the caller can fall back to handle parsing when the display name is empty',
        context: {
          displayName: '',
          expected: { firstName: '', lastName: '' },
        },
      },
      {
        title:
          'should return empty names when the display name is only whitespace',
        context: {
          displayName: '   ',
          expected: { firstName: '', lastName: '' },
        },
      },
      {
        title:
          'should return empty names when forwarders inject an email address into the display-name slot',
        context: {
          displayName: 'jane.smith@example.com',
          expected: { firstName: '', lastName: '' },
        },
      },
    ];

    test.each(testCases)('$title', ({ context: { displayName, expected } }) => {
      expect(getParsedNameFromDisplayName(displayName)).toEqual(expected);
    });
  });
});
