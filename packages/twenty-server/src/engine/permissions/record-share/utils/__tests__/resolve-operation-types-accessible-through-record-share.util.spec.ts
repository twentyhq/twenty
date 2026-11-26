/* @license Enterprise */

import { resolveOperationTypesAccessibleThroughRecordShare } from 'src/engine/permissions/record-share/utils/resolve-operation-types-accessible-through-record-share.util';

const OBJECT = {
  disabledObjectPermissionActions: null,
};

describe('resolveOperationTypesAccessibleThroughRecordShare', () => {
  it('should let a record share grant read, update, soft delete and destroy', () => {
    expect(
      resolveOperationTypesAccessibleThroughRecordShare({
        flatObjectMetadata: OBJECT,
      }),
    ).toEqual(['read', 'update', 'softDelete', 'destroy']);
  });

  it('should not grant an operation the object disables', () => {
    expect(
      resolveOperationTypesAccessibleThroughRecordShare({
        flatObjectMetadata: {
          disabledObjectPermissionActions: [
            'canUpdateObjectRecords',
            'canDestroyObjectRecords',
          ],
        },
      }),
    ).toEqual(['read', 'softDelete']);
  });
});
