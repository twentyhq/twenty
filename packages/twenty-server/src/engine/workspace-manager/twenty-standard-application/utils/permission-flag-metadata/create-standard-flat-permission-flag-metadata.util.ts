import { STANDARD_PERMISSION_FLAG } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-permission-flag.constant';
import { type AllStandardPermissionFlagName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-permission-flag-name.type';
import {
  type CreateStandardPermissionFlagArgs,
  createStandardPermissionFlagFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/permission-flag-metadata/create-standard-permission-flag-flat-metadata.util';

export const STANDARD_FLAT_PERMISSION_FLAG_METADATA_BUILDERS_BY_KEY =
  Object.fromEntries(
    (
      Object.keys(STANDARD_PERMISSION_FLAG) as AllStandardPermissionFlagName[]
    ).map((permissionFlagName) => [
      permissionFlagName,
      (args: Omit<CreateStandardPermissionFlagArgs, 'context'>) =>
        createStandardPermissionFlagFlatMetadata({
          ...args,
          context: { permissionFlagName },
        }),
    ]),
  ) as Record<
    AllStandardPermissionFlagName,
    (
      args: Omit<CreateStandardPermissionFlagArgs, 'context'>,
    ) => ReturnType<typeof createStandardPermissionFlagFlatMetadata>
  >;
