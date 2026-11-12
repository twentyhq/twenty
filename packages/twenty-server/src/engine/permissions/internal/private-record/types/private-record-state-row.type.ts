/* @license Enterprise */

import { type PrivateRecordState } from 'src/engine/permissions/internal/private-record/types/private-record-state.type';

export type PrivateRecordStateRow = PrivateRecordState & {
  id: string;
};
