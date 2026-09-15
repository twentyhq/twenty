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
import { indexRecordSharesByRecordId } from 'src/engine/record-share/utils/index-record-shares-by-record-id.util';

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
    const fetchRecordSharesByRecordId = jest.fn(async () =>
      indexRecordSharesByRecordId([RECORD_SHARE]),
    );

    const gate = await buildRecordShareGate({
      readability: MetadataReadability.OPEN,
      isOwningApplication: false,
      principalIds: ['member-1'],
      fetchRecordSharesByRecordId,
    });

    expect(gate).toBeNull();
    expect(fetchRecordSharesByRecordId).not.toHaveBeenCalled();
  });

  it('denies everyone on a SYSTEM object without fetching the rows', async () => {
    const fetchRecordSharesByRecordId = jest.fn(async () =>
      indexRecordSharesByRecordId([RECORD_SHARE]),
    );

    const gate = await buildRecordShareGate({
      readability: MetadataReadability.SYSTEM,
      isOwningApplication: false,
      principalIds: ['member-1'],
      fetchRecordSharesByRecordId,
    });

    expect(gate).toBe(DENY_ALL_RECORD_SHARE_GATE);
    expect(fetchRecordSharesByRecordId).not.toHaveBeenCalled();
  });

  it('lets the owning application through an APPLICATION object', async () => {
    const gate = await buildRecordShareGate({
      readability: MetadataReadability.APPLICATION,
      isOwningApplication: true,
      principalIds: [],
      fetchRecordSharesByRecordId: async () => new Map(),
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
      fetchRecordSharesByRecordId: async () =>
        indexRecordSharesByRecordId([RECORD_SHARE]),
    });

    expect(gate).toEqual({
      recordSharesByRecordId: indexRecordSharesByRecordId([RECORD_SHARE]),
      principalIds: [EVERYONE_PRINCIPAL_ID, 'role-1'],
    });
  });
});
