import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';

import { type RecordShare } from 'src/engine/record-share/types/record-share.type';
import { indexRecordSharesByObjectMetadataIdAndRecordId } from 'src/engine/record-share/utils/index-record-shares-by-object-metadata-id-and-record-id.util';
import {
  isLinkedRecordSharedWithPrincipals,
  type LinkedRecordShareGate,
} from 'src/engine/record-share/utils/is-linked-record-shared-with-principals.util';

const PRIVATE_OBJECT_ID = 'private-object';
const OPEN_OBJECT_ID = 'open-object';
const SYSTEM_OBJECT_ID = 'system-object';
const SHARED_RECORD_ID = 'shared-record';
const UNSHARED_RECORD_ID = 'unshared-record';

const SHARED_WITH_EVERYONE: RecordShare = {
  id: 'record-share-1',
  recordId: SHARED_RECORD_ID,
  objectMetadataId: PRIVATE_OBJECT_ID,
  principalId: EVERYONE_PRINCIPAL_ID,
  principalType: RecordSharePrincipalType.EVERYONE,
  accessLevel: RecordShareAccessLevel.READ,
  rowCause: RecordShareRowCause.MANUAL,
  sourceId: 'source-1',
};

// the same record id under another object must not leak through the index
const SHARED_UNDER_ANOTHER_OBJECT: RecordShare = {
  ...SHARED_WITH_EVERYONE,
  id: 'record-share-2',
  recordId: UNSHARED_RECORD_ID,
  objectMetadataId: OPEN_OBJECT_ID,
};

const linkedRecordShareGate: LinkedRecordShareGate = {
  gateKindByObjectMetadataId: {
    [PRIVATE_OBJECT_ID]: 'private',
    [OPEN_OBJECT_ID]: 'open',
    [SYSTEM_OBJECT_ID]: 'deny',
  },
  recordSharesByObjectMetadataIdAndRecordId:
    indexRecordSharesByObjectMetadataIdAndRecordId([
      SHARED_WITH_EVERYONE,
      SHARED_UNDER_ANOTHER_OBJECT,
    ]),
  principalIds: [EVERYONE_PRINCIPAL_ID],
};

describe('isLinkedRecordSharedWithPrincipals', () => {
  it.each([
    {
      when: 'the record links to nothing',
      record: {},
      expected: true,
    },
    {
      when: 'the linked object is open',
      record: {
        linkedObjectMetadataId: OPEN_OBJECT_ID,
        linkedRecordId: UNSHARED_RECORD_ID,
      },
      expected: true,
    },
    {
      when: 'the linked object is denied to everyone',
      record: {
        linkedObjectMetadataId: SYSTEM_OBJECT_ID,
        linkedRecordId: SHARED_RECORD_ID,
      },
      expected: false,
    },
    {
      when: 'the linked object is unknown',
      record: {
        linkedObjectMetadataId: 'unknown-object',
        linkedRecordId: SHARED_RECORD_ID,
      },
      expected: true,
    },
    {
      when: 'the private linked record is shared',
      record: {
        linkedObjectMetadataId: PRIVATE_OBJECT_ID,
        linkedRecordId: SHARED_RECORD_ID,
      },
      expected: true,
    },
    {
      when: 'the private linked record is not shared',
      record: {
        linkedObjectMetadataId: PRIVATE_OBJECT_ID,
        linkedRecordId: UNSHARED_RECORD_ID,
      },
      expected: false,
    },
    {
      when: 'the private link carries no record id',
      record: { linkedObjectMetadataId: PRIVATE_OBJECT_ID },
      expected: false,
    },
  ])('should return $expected when $when', ({ record, expected }) => {
    expect(
      isLinkedRecordSharedWithPrincipals({
        record,
        linkedRecordShareGate,
        accessLevels: [RecordShareAccessLevel.READ],
      }),
    ).toBe(expected);
  });
});
