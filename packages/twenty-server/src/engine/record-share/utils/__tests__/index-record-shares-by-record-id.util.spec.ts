import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';

import { type RecordShare } from 'src/engine/record-share/types/record-share.type';
import { indexRecordSharesByRecordId } from 'src/engine/record-share/utils/index-record-shares-by-record-id.util';

const buildRecordShare = (
  recordId: string,
  principalId: string,
): RecordShare => ({
  id: `${recordId}-${principalId}`,
  recordId,
  objectMetadataId: 'object-1',
  principalId,
  principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
  accessLevel: RecordShareAccessLevel.READ,
  rowCause: RecordShareRowCause.MANUAL,
  sourceId: 'source-1',
});

describe('indexRecordSharesByRecordId', () => {
  it('should group every row under its record and keep records apart', () => {
    const firstShareOfRecordOne = buildRecordShare('record-1', 'member-1');
    const secondShareOfRecordOne = buildRecordShare('record-1', 'member-2');
    const shareOfRecordTwo = buildRecordShare('record-2', 'member-1');

    expect(
      indexRecordSharesByRecordId([
        firstShareOfRecordOne,
        shareOfRecordTwo,
        secondShareOfRecordOne,
      ]),
    ).toEqual(
      new Map([
        ['record-1', [firstShareOfRecordOne, secondShareOfRecordOne]],
        ['record-2', [shareOfRecordTwo]],
      ]),
    );
  });

  it('should return an empty index for no rows', () => {
    expect(indexRecordSharesByRecordId([])).toEqual(new Map());
  });
});
