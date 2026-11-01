/* @license Enterprise */

import { type PrivateRecordState } from 'src/engine/permissions/private-record/types/private-record-state.type';
import { resolvePrivateRecordState } from 'src/engine/permissions/private-record/utils/resolve-private-record-state.util';

export const findPermissionsObjectAdmittedRecordIds = ({
  recordIds,
  isLimitedToPublicRecords,
  privateRecordStates,
}: {
  recordIds: string[];
  isLimitedToPublicRecords: boolean;
  privateRecordStates: Map<string, PrivateRecordState>;
}): string[] =>
  recordIds.filter(
    (recordId) =>
      !isLimitedToPublicRecords ||
      !resolvePrivateRecordState({ recordId, privateRecordStates }).isPrivate,
  );
