/* @license Enterprise */

import { type RecordShareAccessLevel } from 'twenty-shared/types';

import {
  type RecordSharePrincipalInput,
  type RecordSharingDTO,
} from 'src/engine/permissions/record-share/dtos/record-sharing.dto';
import { type RecordSharingArgs } from 'src/engine/permissions/record-share/types/record-sharing-args.type';

// An object whose access is not stored as record shares answers the sharing panel itself
export type RecordSharingDelegate = {
  objectUniversalIdentifier: string;
  isEnabled: (workspaceId: string) => Promise<boolean>;
  findRecordSharing: (args: RecordSharingArgs) => Promise<RecordSharingDTO>;
  setShare: (
    args: RecordSharingArgs & {
      principal: RecordSharePrincipalInput;
      accessLevel: RecordShareAccessLevel;
    },
  ) => Promise<RecordSharingDTO>;
  removeShare: (
    args: RecordSharingArgs & { principal: RecordSharePrincipalInput },
  ) => Promise<RecordSharingDTO>;
};
