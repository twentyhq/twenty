import { type ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { SystemPermissionFlag } from 'twenty-shared/constants';

import { PermissionsExceptionCode } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { FlatRolePermissionFlagValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-role-permission-flag-validator.service';

const APPLICATION_UNIVERSAL_IDENTIFIER = 'scheduling-app';
const ROLE_UNIVERSAL_IDENTIFIER = 'scheduling-app-default-role';
const UNKNOWN_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER =
  '20202020-0000-0000-0000-0000000000d4';

const buildCreationArgs = (permissionFlagUniversalIdentifier: string) =>
  ({
    flatEntityToValidate: {
      universalIdentifier: 'role-permission-flag',
      roleUniversalIdentifier: ROLE_UNIVERSAL_IDENTIFIER,
      permissionFlagUniversalIdentifier,
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    },
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatPermissionFlagMaps: { byUniversalIdentifier: {} },
      flatRolePermissionFlagMaps: { byUniversalIdentifier: {} },
      flatRoleMaps: {
        byUniversalIdentifier: {
          [ROLE_UNIVERSAL_IDENTIFIER]: {
            universalIdentifier: ROLE_UNIVERSAL_IDENTIFIER,
            applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
            isEditable: true,
          },
        },
      },
    },
    buildOptions: {
      isSystemBuild: false,
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    },
  }) as unknown as UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.rolePermissionFlag
  >;

describe('FlatRolePermissionFlagValidatorService', () => {
  const validator = new FlatRolePermissionFlagValidatorService();

  it('names the missing standard permission flag when a workspace lacks it', () => {
    const { errors } = validator.validateFlatRolePermissionFlagCreation(
      buildCreationArgs(SystemPermissionFlag.CREATE_CALENDAR_EVENT_TOOL),
    );

    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe(PermissionsExceptionCode.INVALID_SETTING);
    expect(errors[0].message).toBe(
      `Standard permission flag CREATE_CALENDAR_EVENT_TOOL (${SystemPermissionFlag.CREATE_CALENDAR_EVENT_TOOL}) not found in this workspace. Run the workspace upgrade to create it.`,
    );
    expect(errors[0].userFriendlyMessage?.values).toEqual({
      permissionFlagName: 'CREATE_CALENDAR_EVENT_TOOL',
    });
  });

  it('names the missing permission flag by universal identifier when it is not a standard one', () => {
    const { errors } = validator.validateFlatRolePermissionFlagCreation(
      buildCreationArgs(UNKNOWN_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER),
    );

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toBe(
      `Permission flag ${UNKNOWN_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER} not found in this workspace`,
    );
  });
});
