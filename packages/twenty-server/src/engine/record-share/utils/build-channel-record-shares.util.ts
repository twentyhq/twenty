import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type RecordShareInput } from 'src/engine/record-share/types/record-share-input.type';

export const buildChannelRecordShares = ({
  sourceId,
  ownerWorkspaceMemberId,
  isSharedWithEveryone,
  records,
}: {
  sourceId: string;
  ownerWorkspaceMemberId: string | null;
  isSharedWithEveryone: boolean;
  records: { recordId: string; objectMetadataId: string }[];
}): RecordShareInput[] =>
  records.flatMap(({ recordId, objectMetadataId }) => [
    ...(isDefined(ownerWorkspaceMemberId)
      ? [
          {
            recordId,
            objectMetadataId,
            principalId: ownerWorkspaceMemberId,
            principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
            accessLevel: RecordShareAccessLevel.FULL,
            rowCause: RecordShareRowCause.APPLICATION,
            sourceId,
          },
        ]
      : []),
    ...(isSharedWithEveryone
      ? [
          {
            recordId,
            objectMetadataId,
            principalId: EVERYONE_PRINCIPAL_ID,
            principalType: RecordSharePrincipalType.EVERYONE,
            accessLevel: RecordShareAccessLevel.READ,
            rowCause: RecordShareRowCause.APPLICATION,
            sourceId,
          },
        ]
      : []),
  ]);
