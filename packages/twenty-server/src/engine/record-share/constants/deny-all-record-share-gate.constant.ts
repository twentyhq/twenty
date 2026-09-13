import { type RecordShareGate } from 'src/engine/record-share/types/record-share-gate.type';

export const DENY_ALL_RECORD_SHARE_GATE: RecordShareGate = {
  recordSharesByRecordId: new Map(),
  principalIds: [],
};
