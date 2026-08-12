import { type ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { type UniversalFlatPermissionFlag } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-permission-flag.type';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { type WorkspaceMigrationBuilderOptions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';

const CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER = 'custom-application';

export const buildFlatPermissionFlag = ({
  universalIdentifier,
  key,
  permissionType = 'settings',
  applicationUniversalIdentifier = CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
}: {
  universalIdentifier: string;
  key: string;
  permissionType?: string;
  applicationUniversalIdentifier?: string;
}): UniversalFlatPermissionFlag =>
  ({
    universalIdentifier,
    key,
    permissionType,
    applicationUniversalIdentifier,
  }) as UniversalFlatPermissionFlag;

export const buildStandardAppFlatPermissionFlag = (args: {
  universalIdentifier: string;
  key: string;
}): UniversalFlatPermissionFlag =>
  buildFlatPermissionFlag({
    ...args,
    applicationUniversalIdentifier:
      TWENTY_STANDARD_APPLICATION.universalIdentifier,
  });

const buildMaps = (flags: UniversalFlatPermissionFlag[]) => ({
  byUniversalIdentifier: Object.fromEntries(
    flags.map((flag) => [flag.universalIdentifier, flag]),
  ),
});

export const buildBuildOptions = ({
  isCallerStandardApp = false,
}: {
  isCallerStandardApp?: boolean;
} = {}): WorkspaceMigrationBuilderOptions => ({
  isSystemBuild: false,
  applicationUniversalIdentifier: isCallerStandardApp
    ? TWENTY_STANDARD_APPLICATION.universalIdentifier
    : CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
});

export const buildCreationArgs = ({
  flatEntityToValidate,
  existingFlags = [],
  isCallerStandardApp = false,
}: {
  flatEntityToValidate: UniversalFlatPermissionFlag;
  existingFlags?: UniversalFlatPermissionFlag[];
  isCallerStandardApp?: boolean;
}): UniversalFlatEntityValidationArgs<
  typeof ALL_METADATA_NAME.permissionFlag
> =>
  ({
    flatEntityToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatPermissionFlagMaps: buildMaps(existingFlags),
    },
    buildOptions: buildBuildOptions({ isCallerStandardApp }),
    workspaceId: 'workspace-id',
    remainingFlatEntityMapsToValidate: buildMaps([]),
    additionalCacheDataMaps: {},
  }) as unknown as UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.permissionFlag
  >;

export const buildUpdateArgs = ({
  universalIdentifier,
  flatEntityUpdate,
  existingFlags = [],
  isCallerStandardApp = false,
}: {
  universalIdentifier: string;
  // Loosely typed so tests can exercise the runtime guards against
  // manifest-provided values the compiler would otherwise reject
  flatEntityUpdate: Partial<Record<keyof UniversalFlatPermissionFlag, unknown>>;
  existingFlags?: UniversalFlatPermissionFlag[];
  isCallerStandardApp?: boolean;
}): FlatEntityUpdateValidationArgs<typeof ALL_METADATA_NAME.permissionFlag> =>
  ({
    universalIdentifier,
    flatEntityUpdate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatPermissionFlagMaps: buildMaps(existingFlags),
    },
    buildOptions: buildBuildOptions({ isCallerStandardApp }),
    workspaceId: 'workspace-id',
    remainingFlatEntityMapsToValidate: buildMaps([]),
    additionalCacheDataMaps: {},
  }) as unknown as FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.permissionFlag
  >;
