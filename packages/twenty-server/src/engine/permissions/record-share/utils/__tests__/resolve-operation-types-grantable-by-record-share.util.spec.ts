/* @license Enterprise */

import { FeatureFlagKey } from 'twenty-shared/types';

import { resolveOperationTypesGrantableByRecordShare } from 'src/engine/permissions/record-share/utils/resolve-operation-types-grantable-by-record-share.util';

const RECORD_SHARING = {
  [FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED]: true,
};

describe('resolveOperationTypesGrantableByRecordShare', () => {
  it('should let a record share grant read, update, soft delete and destroy once record sharing is enabled', () => {
    expect(
      resolveOperationTypesGrantableByRecordShare({
        flatObjectMetadata: { disabledObjectPermissionActions: null },
        featureFlagsMap: RECORD_SHARING,
      }),
    ).toEqual(['read', 'update', 'softDelete', 'destroy']);
  });

  it('should grant nothing while record sharing is disabled', () => {
    expect(
      resolveOperationTypesGrantableByRecordShare({
        flatObjectMetadata: { disabledObjectPermissionActions: null },
        featureFlagsMap: {},
      }),
    ).toEqual([]);
  });

  it('should not grant an operation the object disables', () => {
    expect(
      resolveOperationTypesGrantableByRecordShare({
        flatObjectMetadata: {
          disabledObjectPermissionActions: [
            'canUpdateObjectRecords',
            'canDestroyObjectRecords',
          ],
        },
        featureFlagsMap: RECORD_SHARING,
      }),
    ).toEqual(['read', 'softDelete']);
  });
});
