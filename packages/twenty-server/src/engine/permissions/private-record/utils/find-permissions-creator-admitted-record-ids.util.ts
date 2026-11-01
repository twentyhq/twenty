/* @license Enterprise */

import { type PrivateRecordState } from 'src/engine/permissions/private-record/types/private-record-state.type';
import { resolvePrivateRecordState } from 'src/engine/permissions/private-record/utils/resolve-private-record-state.util';

export const findPermissionsCreatorAdmittedRecordIds = ({
  recordIds,
  workspaceMemberId,
  privateRecordStates,
}: {
  recordIds: string[];
  workspaceMemberId: string;
  privateRecordStates: Map<string, PrivateRecordState>;
}): string[] =>
  recordIds.filter((recordId) => {
    const { isPrivate, createdByWorkspaceMemberId } = resolvePrivateRecordState(
      { recordId, privateRecordStates },
    );

    return isPrivate && createdByWorkspaceMemberId === workspaceMemberId;
  });
