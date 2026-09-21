import { PermissionFlagExceptionCode } from 'src/engine/metadata-modules/permission-flag/permission-flag.exception';
import { validateFlatPermissionFlagUpdate } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-permission-flag-update.util';

import {
  buildFlatPermissionFlag,
  buildStandardAppFlatPermissionFlag,
  buildUpdateArgs,
} from './flat-permission-flag-validation.test-util';

const existingFlag = buildFlatPermissionFlag({
  universalIdentifier: 'existing-flag',
  key: 'CAN_DO_THING',
});

describe('validateFlatPermissionFlagUpdate', () => {
  it('should return no error when updating a mutable property', () => {
    const result = validateFlatPermissionFlagUpdate(
      buildUpdateArgs({
        universalIdentifier: 'existing-flag',
        flatEntityUpdate: { permissionType: 'tool' },
        existingFlags: [existingFlag],
      }),
    );

    expect(result.errors).toEqual([]);
    expect(result.type).toBe('update');
  });

  it('should report not-found and stop when the flag does not exist', () => {
    const result = validateFlatPermissionFlagUpdate(
      buildUpdateArgs({
        universalIdentifier: 'missing-flag',
        flatEntityUpdate: { key: 'ANYTHING' },
        existingFlags: [existingFlag],
      }),
    );

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].code).toBe(
      PermissionFlagExceptionCode.PERMISSION_FLAG_NOT_FOUND,
    );
  });

  it('should reject a key change', () => {
    const result = validateFlatPermissionFlagUpdate(
      buildUpdateArgs({
        universalIdentifier: 'existing-flag',
        flatEntityUpdate: { key: 'A_NEW_KEY' },
        existingFlags: [existingFlag],
      }),
    );

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].code).toBe(
      PermissionFlagExceptionCode.PERMISSION_FLAG_KEY_IMMUTABLE,
    );
  });

  it('should allow setting the key to its current value', () => {
    const result = validateFlatPermissionFlagUpdate(
      buildUpdateArgs({
        universalIdentifier: 'existing-flag',
        flatEntityUpdate: { key: 'CAN_DO_THING' },
        existingFlags: [existingFlag],
      }),
    );

    expect(result.errors).toEqual([]);
  });

  it('should reject an unsupported permission type', () => {
    const result = validateFlatPermissionFlagUpdate(
      buildUpdateArgs({
        universalIdentifier: 'existing-flag',
        flatEntityUpdate: { permissionType: 'not-a-permission-type' },
        existingFlags: [existingFlag],
      }),
    );

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].code).toBe(
      PermissionFlagExceptionCode.INVALID_PERMISSION_FLAG_PERMISSION_TYPE,
    );
  });

  it('should reject a non-standard caller updating a standard flag', () => {
    const standardFlag = buildStandardAppFlatPermissionFlag({
      universalIdentifier: 'standard-flag',
      key: 'CAN_DO_STANDARD_THING',
    });

    const result = validateFlatPermissionFlagUpdate(
      buildUpdateArgs({
        universalIdentifier: 'standard-flag',
        flatEntityUpdate: { permissionType: 'tool' },
        existingFlags: [standardFlag],
        isCallerStandardApp: false,
      }),
    );

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].code).toBe(
      PermissionFlagExceptionCode.PERMISSION_FLAG_IS_STANDARD,
    );
  });

  it('should let the standard app update its own standard flag', () => {
    const standardFlag = buildStandardAppFlatPermissionFlag({
      universalIdentifier: 'standard-flag',
      key: 'CAN_DO_STANDARD_THING',
    });

    const result = validateFlatPermissionFlagUpdate(
      buildUpdateArgs({
        universalIdentifier: 'standard-flag',
        flatEntityUpdate: { permissionType: 'tool' },
        existingFlags: [standardFlag],
        isCallerStandardApp: true,
      }),
    );

    expect(result.errors).toEqual([]);
  });
});
