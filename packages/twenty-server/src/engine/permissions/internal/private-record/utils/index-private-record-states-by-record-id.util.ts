/* @license Enterprise */

import { type PrivateRecordState } from 'src/engine/permissions/internal/private-record/types/private-record-state.type';
import { type PrivateRecordStateRow } from 'src/engine/permissions/internal/private-record/types/private-record-state-row.type';

export const indexPrivateRecordStatesByRecordId = (
  rows: PrivateRecordStateRow[],
): Map<string, PrivateRecordState> =>
  new Map(
    rows.map(({ id, isPrivate, createdByWorkspaceMemberId }) => [
      id,
      { isPrivate, createdByWorkspaceMemberId },
    ]),
  );
