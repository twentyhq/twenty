/* @license Enterprise */

import { type PrivateRecordStorageService } from 'src/engine/permissions/private-record/services/private-record-storage.service';

export const PUBLIC_PRIVATE_RECORD_STORAGE_SERVICE_MOCK: Pick<
  PrivateRecordStorageService,
  'findStates'
> = {
  findStates: async ({ recordIds }) =>
    new Map(
      recordIds.map((recordId) => [
        recordId,
        { isPrivate: false, createdByWorkspaceMemberId: null },
      ]),
    ),
};
