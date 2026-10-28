import {
  PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';

import { PermissionFlagExceptionCode } from 'src/engine/metadata-modules/permission-flag/permission-flag.exception';
import { validateFlatPermissionFlagCreation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-permission-flag-creation.util';

import {
  buildCreationArgs,
  buildFlatPermissionFlag,
  buildStandardAppFlatPermissionFlag,
} from './flat-permission-flag-validation.test-util';

describe('validateFlatPermissionFlagCreation', () => {
  it('should return no error for a valid permission flag', () => {
    const result = validateFlatPermissionFlagCreation(
      buildCreationArgs({
        flatEntityToValidate: buildFlatPermissionFlag({
          universalIdentifier: 'new-flag',
          key: 'CAN_DO_THING',
        }),
      }),
    );

    expect(result.errors).toEqual([]);
    expect(result.type).toBe('create');
    expect(result.metadataName).toBe('permissionFlag');
  });

  it('should report an error when the universal identifier already exists', () => {
    const existing = buildFlatPermissionFlag({
      universalIdentifier: 'existing-flag',
      key: 'CAN_DO_THING',
    });

    const result = validateFlatPermissionFlagCreation(
      buildCreationArgs({
        flatEntityToValidate: buildFlatPermissionFlag({
          universalIdentifier: 'existing-flag',
          key: 'CAN_DO_OTHER_THING',
        }),
        existingFlags: [existing],
      }),
    );

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].code).toBe(
      PermissionFlagExceptionCode.PERMISSION_FLAG_ALREADY_EXISTS,
    );
  });

  it('should report an error when the key is empty', () => {
    const result = validateFlatPermissionFlagCreation(
      buildCreationArgs({
        flatEntityToValidate: buildFlatPermissionFlag({
          universalIdentifier: 'new-flag',
          key: '',
        }),
      }),
    );

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].code).toBe(
      PermissionFlagExceptionCode.INVALID_PERMISSION_FLAG_KEY,
    );
  });

  it('should report an error when another flag already registered the same key', () => {
    const result = validateFlatPermissionFlagCreation(
      buildCreationArgs({
        flatEntityToValidate: buildFlatPermissionFlag({
          universalIdentifier: 'new-flag',
          key: 'CAN_DO_THING',
        }),
        existingFlags: [
          buildFlatPermissionFlag({
            universalIdentifier: 'other-app-flag',
            key: 'CAN_DO_THING',
          }),
        ],
      }),
    );

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].code).toBe(
      PermissionFlagExceptionCode.PERMISSION_FLAG_ALREADY_EXISTS,
    );
    expect(result.errors[0].message).toContain('CAN_DO_THING');
  });

  it.each([PermissionFlagType.USER_APPS, 'CONNECTED_ACCOUNTS', 'APPLICATIONS'])(
    'should report an error when an app flag uses the reserved key %s',
    (key) => {
      const result = validateFlatPermissionFlagCreation(
        buildCreationArgs({
          flatEntityToValidate: buildFlatPermissionFlag({
            universalIdentifier: 'new-flag',
            key,
          }),
        }),
      );

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe(
        PermissionFlagExceptionCode.INVALID_PERMISSION_FLAG_KEY,
      );
      expect(result.errors[0].message).toContain(key);
    },
  );

  it('should only report the reservation when an app flag reuses the key of an existing standard flag', () => {
    const result = validateFlatPermissionFlagCreation(
      buildCreationArgs({
        flatEntityToValidate: buildFlatPermissionFlag({
          universalIdentifier: 'new-flag',
          key: PermissionFlagType.USER_APPS,
        }),
        existingFlags: [
          buildStandardAppFlatPermissionFlag({
            universalIdentifier: SystemPermissionFlag.USER_APPS,
            key: PermissionFlagType.USER_APPS,
          }),
        ],
      }),
    );

    expect(result.errors.map(({ code }) => code)).toEqual([
      PermissionFlagExceptionCode.INVALID_PERMISSION_FLAG_KEY,
    ]);
  });

  it('should accept a standard permission flag key on a flag owned by the standard app', () => {
    const result = validateFlatPermissionFlagCreation(
      buildCreationArgs({
        flatEntityToValidate: buildStandardAppFlatPermissionFlag({
          universalIdentifier: SystemPermissionFlag.USER_APPS,
          key: PermissionFlagType.USER_APPS,
        }),
      }),
    );

    expect(result.errors).toEqual([]);
  });

  it('should report an error for an unsupported permission type', () => {
    const result = validateFlatPermissionFlagCreation(
      buildCreationArgs({
        flatEntityToValidate: buildFlatPermissionFlag({
          universalIdentifier: 'new-flag',
          key: 'CAN_DO_THING',
          permissionType: 'not-a-permission-type',
        }),
      }),
    );

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].code).toBe(
      PermissionFlagExceptionCode.INVALID_PERMISSION_FLAG_PERMISSION_TYPE,
    );
  });

  it('should accumulate every violation rather than stopping at the first', () => {
    const result = validateFlatPermissionFlagCreation(
      buildCreationArgs({
        flatEntityToValidate: buildFlatPermissionFlag({
          universalIdentifier: 'existing-flag',
          key: '',
          permissionType: 'not-a-permission-type',
        }),
        existingFlags: [
          buildFlatPermissionFlag({
            universalIdentifier: 'existing-flag',
            key: 'CAN_DO_THING',
          }),
        ],
      }),
    );

    expect(result.errors.map((error) => error.code)).toEqual([
      PermissionFlagExceptionCode.PERMISSION_FLAG_ALREADY_EXISTS,
      PermissionFlagExceptionCode.INVALID_PERMISSION_FLAG_KEY,
      PermissionFlagExceptionCode.INVALID_PERMISSION_FLAG_PERMISSION_TYPE,
    ]);
  });

  it('should not flag a key collision against itself', () => {
    const flag = buildFlatPermissionFlag({
      universalIdentifier: 'same-flag',
      key: 'CAN_DO_THING',
    });

    const result = validateFlatPermissionFlagCreation(
      buildCreationArgs({
        flatEntityToValidate: flag,
        existingFlags: [flag],
      }),
    );

    expect(result.errors.map((error) => error.code)).toEqual([
      PermissionFlagExceptionCode.PERMISSION_FLAG_ALREADY_EXISTS,
    ]);
    expect(result.errors[0].message).toContain('universal identifier');
  });
});
