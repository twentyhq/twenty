/* @license Enterprise */

import { type PrivateRecordState } from 'src/engine/permissions/private-record/types/private-record-state.type';

const UNKNOWN_PRIVATE_RECORD_STATE: PrivateRecordState = {
  isPrivate: false,
  createdByWorkspaceMemberId: null,
};

export const resolvePrivateRecordState = ({
  recordId,
  privateRecordStates,
}: {
  recordId: string;
  privateRecordStates: Map<string, PrivateRecordState>;
}): PrivateRecordState =>
  privateRecordStates.get(recordId) ?? UNKNOWN_PRIVATE_RECORD_STATE;
