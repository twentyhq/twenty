import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import {
  MetadataReadability,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';

import { DENY_ALL_RECORD_SHARE_GATE } from 'src/engine/record-share/constants/deny-all-record-share-gate.constant';
import { type RecordShare } from 'src/engine/record-share/types/record-share.type';
import { buildRecordShareGate } from 'src/engine/record-share/utils/build-record-share-gate.util';

const RECORD_SHARE: RecordShare = {
  id: 'record-share-1',
  recordId: 'record-1',
  objectMetadataId: 'object-1',
  principalId: 'member-1',
  principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
  accessLevel: RecordShareAccessLevel.READ,
  rowCause: RecordShareRowCause.MANUAL,
  sourceId: 'member-2',
} as RecordShare;

describe('buildRecordShareGate', () => {
  it('does not gate an OPEN object and does not fetch the rows', async () => {
    const fetchRecordShares = jest.fn(async () => [RECORD_SHARE]);

    const gate = await buildRecordShareGate({
      readability: MetadataReadability.OPEN,
      isOwningApplication: false,
      principalIds: ['member-1'],
      fetchRecordShares,
    });

    expect(gate).toBeNull();
    expect(fetchRecordShares).not.toHaveBeenCalled();
  });

  it('denies everyone on a SYSTEM object without fetching the rows', async () => {
    const fetchRecordShares = jest.fn(async () => [RECORD_SHARE]);

    const gate = await buildRecordShareGate({
      readability: MetadataReadability.SYSTEM,
      isOwningApplication: false,
      principalIds: ['member-1'],
      fetchRecordShares,
    });

    expect(gate).toBe(DENY_ALL_RECORD_SHARE_GATE);
    expect(fetchRecordShares).not.toHaveBeenCalled();
  });

  it('lets the owning application through an APPLICATION object', async () => {
    const gate = await buildRecordShareGate({
      readability: MetadataReadability.APPLICATION,
      isOwningApplication: true,
      principalIds: [],
      fetchRecordShares: async () => [],
    });

    expect(gate).toBeNull();
  });

  it('fetches the rows of a PRIVATE object and keeps each principal once', async () => {
    const gate = await buildRecordShareGate({
      readability: MetadataReadability.PRIVATE,
      isOwningApplication: false,
      principalIds: [
        EVERYONE_PRINCIPAL_ID,
        undefined,
        'role-1',
        'role-1',
        null,
      ],
      fetchRecordShares: async () => [RECORD_SHARE],
    });

    expect(gate).toEqual({
      recordShares: [RECORD_SHARE],
      principalIds: [EVERYONE_PRINCIPAL_ID, 'role-1'],
    });
  });
});
