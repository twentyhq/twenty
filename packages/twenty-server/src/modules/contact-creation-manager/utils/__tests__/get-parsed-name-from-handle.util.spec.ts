import { type EachTestingContext } from 'twenty-shared/testing';

import { getParsedNameFromHandle } from 'src/modules/contact-creation-manager/utils/get-parsed-name-from-handle.util';

type TestCase = EachTestingContext<{
  handle: string;
  expected: { firstName: string; lastName: string };
}>;

describe('getParsedNameFromHandle', () => {
  const testCases: TestCase[] = [
    {
      title:
        'should derive first and last name from the local part of a standard email',
      context: {
        handle: 'john.doe@example.com',
        expected: { firstName: 'john', lastName: 'doe' },
      },
    },
    {
      title: 'should ignore the domain entirely',
      context: {
        handle: 'john.doe@deeply.nested.subdomain.example.com',
        expected: { firstName: 'john', lastName: 'doe' },
      },
    },
    {
      title:
        'should return only a first name when the local part has no dot separator',
      context: {
        handle: 'noname@example.com',
        expected: { firstName: 'noname', lastName: '' },
      },
    },
    {
      title:
        'should treat an input without an @ as a bare local part rather than rejecting it',
      context: {
        handle: 'lonely.handle',
        expected: { firstName: 'lonely', lastName: 'handle' },
      },
    },
    {
      title: 'should return empty names for an empty handle',
      context: {
        handle: '',
        expected: { firstName: '', lastName: '' },
      },
    },
  ];

  test.each(testCases)('$title', ({ context: { handle, expected } }) => {
    expect(getParsedNameFromHandle(handle)).toEqual(expected);
  });
});
