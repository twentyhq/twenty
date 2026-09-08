import { type RecordShare } from 'src/engine/record-share/types/record-share.type';

export type RecordShareGate = {
  recordShares: RecordShare[];
  principalIds: string[];
};
