import { MetadataReadability } from 'twenty-shared/types';

import { resolveRecordShareGateKind } from 'src/engine/record-share/utils/resolve-record-share-gate-kind.util';

describe('resolveRecordShareGateKind', () => {
  it.each([
    {
      readability: MetadataReadability.OPEN,
      isOwningApplication: false,
      expected: 'open',
    },
    {
      readability: MetadataReadability.OPEN,
      isOwningApplication: true,
      expected: 'open',
    },
    {
      readability: MetadataReadability.INHERITED,
      isOwningApplication: false,
      expected: 'open',
    },
    {
      readability: MetadataReadability.SYSTEM,
      isOwningApplication: false,
      expected: 'deny',
    },
    {
      readability: MetadataReadability.SYSTEM,
      isOwningApplication: true,
      expected: 'deny',
    },
    {
      readability: MetadataReadability.APPLICATION,
      isOwningApplication: false,
      expected: 'deny',
    },
    {
      readability: MetadataReadability.APPLICATION,
      isOwningApplication: true,
      expected: 'open',
    },
    {
      readability: MetadataReadability.PRIVATE,
      isOwningApplication: false,
      expected: 'private',
    },
    {
      readability: MetadataReadability.PRIVATE,
      isOwningApplication: true,
      expected: 'open',
    },
  ])(
    'should resolve $expected for $readability readability when isOwningApplication is $isOwningApplication',
    ({ readability, isOwningApplication, expected }) => {
      expect(
        resolveRecordShareGateKind({ readability, isOwningApplication }),
      ).toBe(expected);
    },
  );
});
