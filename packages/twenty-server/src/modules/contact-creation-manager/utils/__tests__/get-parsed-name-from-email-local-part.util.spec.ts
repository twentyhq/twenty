import { type EachTestingContext } from 'twenty-shared/testing';

import { getParsedNameFromEmailLocalPart } from 'src/modules/contact-creation-manager/utils/get-parsed-name-from-email-local-part.util';

type TestCase = EachTestingContext<{
  localPart: string;
  expected: { firstName: string; lastName: string };
}>;

describe('getParsedNameFromEmailLocalPart', () => {
  const testCases: TestCase[] = [
    {
      title:
        'should split a dotted local part into first and last name segments',
      context: {
        localPart: 'john.doe',
        expected: { firstName: 'john', lastName: 'doe' },
      },
    },
    {
      title:
        'should keep the trailing dot-segments together as a multi-word last name',
      context: {
        localPart: 'jean.luc.picard',
        expected: { firstName: 'jean', lastName: 'luc picard' },
      },
    },
    {
      title:
        'should fall back to the whole local part as first name when no dot is present',
      context: {
        localPart: 'noname',
        expected: { firstName: 'noname', lastName: '' },
      },
    },
    {
      title:
        'should ignore consecutive dots so they do not produce empty segments',
      context: {
        localPart: 'john..doe',
        expected: { firstName: 'john', lastName: 'doe' },
      },
    },
    {
      title:
        'should ignore a leading dot rather than producing an empty first name',
      context: {
        localPart: '.john.doe',
        expected: { firstName: 'john', lastName: 'doe' },
      },
    },
    {
      title: 'should return empty names for an empty local part',
      context: {
        localPart: '',
        expected: { firstName: '', lastName: '' },
      },
    },
    {
      title:
        'should strip an RFC 5233 plus-address tag so routing metadata does not end up in the name',
      context: {
        localPart: 'john.doe+sales',
        expected: { firstName: 'john', lastName: 'doe' },
      },
    },
    {
      title:
        'should strip a plus-address tag even when the local part has no dot',
      context: {
        localPart: 'noname+ticket-123',
        expected: { firstName: 'noname', lastName: '' },
      },
    },
  ];

  test.each(testCases)('$title', ({ context: { localPart, expected } }) => {
    expect(getParsedNameFromEmailLocalPart(localPart)).toEqual(expected);
  });
});
