import { type EachTestingContext } from 'twenty-shared/testing';

import { getFirstNameAndLastNameFromHandleAndDisplayName } from 'src/modules/contact-creation-manager/utils/get-first-name-and-last-name-from-handle-and-display-name.util';

type TestCase = EachTestingContext<{
  handle: string;
  displayName: string;
  expected: { firstName: string; lastName: string };
}>;

describe('getFirstNameAndLastNameFromHandleAndDisplayName', () => {
  const testCases: TestCase[] = [
    {
      title: 'should parse a standard "First Last" display name',
      context: {
        handle: 'john.doe@example.com',
        displayName: 'John Doe',
        expected: { firstName: 'John', lastName: 'Doe' },
      },
    },
    {
      title: 'should swap "Last, First" comma format',
      context: {
        handle: 'john.doe@example.com',
        displayName: 'Doe, John',
        expected: { firstName: 'John', lastName: 'Doe' },
      },
    },
    {
      title: 'should de-duplicate "First.Last Last" synthesized form',
      context: {
        handle: 'john.doe@example.com',
        displayName: 'John.Doe Doe',
        expected: { firstName: 'John', lastName: 'Doe' },
      },
    },
    {
      title: 'should keep all trailing tokens as a multi-word last name',
      context: {
        handle: 'mjw@example.com',
        displayName: 'Mary Jane Watson',
        expected: { firstName: 'Mary', lastName: 'Jane Watson' },
      },
    },
    {
      title: 'should split a single dotted token into first and last',
      context: {
        handle: 'john.doe@example.com',
        displayName: 'john.doe',
        expected: { firstName: 'John', lastName: 'Doe' },
      },
    },
    {
      title:
        'should accept a single-word display name and fall back to handle for last',
      context: {
        handle: 'first.someone@example.com',
        displayName: 'First',
        expected: { firstName: 'First', lastName: 'Someone' },
      },
    },
    {
      title: 'should fall back to handle when display name is empty',
      context: {
        handle: 'john.doe@example.com',
        displayName: '',
        expected: { firstName: 'John', lastName: 'Doe' },
      },
    },
    {
      title: 'should fall back to handle even when handle has no dot',
      context: {
        handle: 'noname@example.com',
        displayName: '',
        expected: { firstName: 'Noname', lastName: '' },
      },
    },
    {
      title: 'should strip wrapping quotes before parsing',
      context: {
        handle: 'john.doe@example.com',
        displayName: '"Doe, John"',
        expected: { firstName: 'John', lastName: 'Doe' },
      },
    },
    {
      title: 'should collapse extra whitespace',
      context: {
        handle: 'jd@example.com',
        displayName: '  John  Doe  ',
        expected: { firstName: 'John', lastName: 'Doe' },
      },
    },
    {
      title: 'should expand "John.Doe Smith" into "John" + "Doe Smith"',
      context: {
        handle: 'jd@example.com',
        displayName: 'John.Doe Smith',
        expected: { firstName: 'John', lastName: 'Doe Smith' },
      },
    },
    {
      title: 'should preserve multi-dot handle local-parts on fallback',
      context: {
        handle: 'jean.luc.picard@example.com',
        displayName: '',
        expected: { firstName: 'Jean', lastName: 'Luc picard' },
      },
    },
    {
      title:
        'should fall back to handle when display name contains the address',
      context: {
        handle: 'jane.smith@example.com',
        displayName: 'Jane.smith@example.com Smith',
        expected: { firstName: 'Jane', lastName: 'Smith' },
      },
    },
    {
      title:
        'should fall back to handle for single-token email-as-display-name',
      context: {
        handle: 'janesmith@example.com',
        displayName: 'Janesmith@example.com',
        expected: { firstName: 'Janesmith', lastName: '' },
      },
    },
    {
      title:
        'should strip ":XXX" group-code suffix from comma-format first name',
      context: {
        handle: 'jane.smith@example.com',
        displayName: 'Smith, Jane:GROUP',
        expected: { firstName: 'Jane', lastName: 'Smith' },
      },
    },
    {
      title: 'should strip ":XXX" suffix from a multi-token display name',
      context: {
        handle: 'jane.smith@example.com',
        displayName: 'Jane:GROUP Smith',
        expected: { firstName: 'Jane', lastName: 'Smith' },
      },
    },
  ];

  test.each(testCases)(
    '$title',
    ({ context: { handle, displayName, expected } }) => {
      expect(
        getFirstNameAndLastNameFromHandleAndDisplayName(handle, displayName),
      ).toEqual(expected);
    },
  );
});
