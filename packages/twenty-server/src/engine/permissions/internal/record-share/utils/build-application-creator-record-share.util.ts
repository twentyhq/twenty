/* @license Enterprise */

import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';

import { type RecordShareInput } from 'src/engine/permissions/record-share/types/record-share-input.type';

export const buildApplicationCreatorRecordShare = ({
  applicationRoleId,
  applicationId,
}: {
  applicationRoleId: string;
  applicationId: string;
}): Omit<RecordShareInput, 'recordId' | 'objectMetadataId'> => ({
  principalId: applicationRoleId,
  principalType: RecordSharePrincipalType.ROLE,
  accessLevel: RecordShareAccessLevel.FULL,
  rowCause: RecordShareRowCause.APPLICATION,
  sourceId: applicationId,
});
