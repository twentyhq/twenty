import { PermissionFlagExceptionCode } from 'src/engine/metadata-modules/permission-flag/permission-flag.exception';
import { validateFlatPermissionFlagDeletion } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-permission-flag-deletion.util';

import {
  buildCreationArgs,
  buildFlatPermissionFlag,
  buildStandardAppFlatPermissionFlag,
} from './flat-permission-flag-validation.test-util';

describe('validateFlatPermissionFlagDeletion', () => {
  it('should return no error when deleting an existing custom flag', () => {
    const flag = buildFlatPermissionFlag({
      universalIdentifier: 'existing-flag',
      key: 'CAN_DO_THING',
    });

    const result = validateFlatPermissionFlagDeletion(
      buildCreationArgs({
        flatEntityToValidate: flag,
        existingFlags: [flag],
      }),
    );

    expect(result.errors).toEqual([]);
    expect(result.type).toBe('delete');
  });

  it('should report not-found when the flag does not exist', () => {
    const result = validateFlatPermissionFlagDeletion(
      buildCreationArgs({
        flatEntityToValidate: buildFlatPermissionFlag({
          universalIdentifier: 'missing-flag',
          key: 'CAN_DO_THING',
        }),
        existingFlags: [],
      }),
    );

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].code).toBe(
      PermissionFlagExceptionCode.PERMISSION_FLAG_NOT_FOUND,
    );
  });

  it('should reject a non-standard caller deleting a standard flag', () => {
    const standardFlag = buildStandardAppFlatPermissionFlag({
      universalIdentifier: 'standard-flag',
      key: 'CAN_DO_STANDARD_THING',
    });

    const result = validateFlatPermissionFlagDeletion(
      buildCreationArgs({
        flatEntityToValidate: standardFlag,
        existingFlags: [standardFlag],
        isCallerStandardApp: false,
      }),
    );

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].code).toBe(
      PermissionFlagExceptionCode.PERMISSION_FLAG_IS_STANDARD,
    );
  });

  it('should let the standard app delete its own standard flag', () => {
    const standardFlag = buildStandardAppFlatPermissionFlag({
      universalIdentifier: 'standard-flag',
      key: 'CAN_DO_STANDARD_THING',
    });

    const result = validateFlatPermissionFlagDeletion(
      buildCreationArgs({
        flatEntityToValidate: standardFlag,
        existingFlags: [standardFlag],
        isCallerStandardApp: true,
      }),
    );

    expect(result.errors).toEqual([]);
  });
});
