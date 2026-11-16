/* @license Enterprise */

import { RecordShareAccessLevel } from 'twenty-shared/types';

// FULL lets its holder manage sharing, so it is only granted by name
export const GENERAL_RECORD_SHARE_ACCESS_LEVELS: RecordShareAccessLevel[] = [
  RecordShareAccessLevel.NONE,
  RecordShareAccessLevel.READ,
  RecordShareAccessLevel.READ_WRITE,
];
