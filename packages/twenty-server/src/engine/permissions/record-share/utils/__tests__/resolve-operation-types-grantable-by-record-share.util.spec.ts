/* @license Enterprise */

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FeatureFlagKey } from 'twenty-shared/types';

import { resolveOperationTypesGrantableByRecordShare } from 'src/engine/permissions/record-share/utils/resolve-operation-types-grantable-by-record-share.util';

const RECORD_SHARING = {
  [FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED]: true,
};

const OBJECT = {
  universalIdentifier: 'custom-object',
  disabledObjectPermissionActions: null,
};

describe('resolveOperationTypesGrantableByRecordShare', () => {
  it('should let a record share grant read, update, soft delete and destroy once record sharing is enabled', () => {
    expect(
      resolveOperationTypesGrantableByRecordShare({
        flatObjectMetadata: OBJECT,
        featureFlagsMap: RECORD_SHARING,
      }),
    ).toEqual(['read', 'update', 'softDelete', 'destroy']);
  });

  it('should grant nothing while record sharing is disabled', () => {
    expect(
      resolveOperationTypesGrantableByRecordShare({
        flatObjectMetadata: OBJECT,
        featureFlagsMap: {},
      }),
    ).toEqual([]);
  });

  it('should not grant an operation the object disables', () => {
    expect(
      resolveOperationTypesGrantableByRecordShare({
        flatObjectMetadata: {
          ...OBJECT,
          disabledObjectPermissionActions: [
            'canUpdateObjectRecords',
            'canDestroyObjectRecords',
          ],
        },
        featureFlagsMap: RECORD_SHARING,
      }),
    ).toEqual(['read', 'softDelete']);
  });

  it('should grant on a private by default object while record sharing is disabled', () => {
    expect(
      resolveOperationTypesGrantableByRecordShare({
        flatObjectMetadata: {
          ...OBJECT,
          universalIdentifier:
            STANDARD_OBJECTS.agentChatThread.universalIdentifier,
        },
        featureFlagsMap: {},
      }),
    ).toEqual(['read', 'update', 'softDelete', 'destroy']);
  });
});
