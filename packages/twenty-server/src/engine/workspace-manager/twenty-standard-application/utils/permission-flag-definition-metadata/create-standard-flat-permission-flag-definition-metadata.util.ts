import { STANDARD_PERMISSION_FLAG_DEFINITION } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-permission-flag-definition.constant';
import { type AllStandardPermissionFlagDefinitionName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-permission-flag-definition-name.type';
import {
  type CreateStandardPermissionFlagDefinitionArgs,
  createStandardPermissionFlagDefinitionFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/permission-flag-definition-metadata/create-standard-permission-flag-definition-flat-metadata.util';

export const STANDARD_FLAT_PERMISSION_FLAG_DEFINITION_METADATA_BUILDERS_BY_KEY =
  Object.fromEntries(
    (
      Object.keys(
        STANDARD_PERMISSION_FLAG_DEFINITION,
      ) as AllStandardPermissionFlagDefinitionName[]
    ).map((permissionFlagDefinitionName) => [
      permissionFlagDefinitionName,
      (args: Omit<CreateStandardPermissionFlagDefinitionArgs, 'context'>) =>
        createStandardPermissionFlagDefinitionFlatMetadata({
          ...args,
          context: { permissionFlagDefinitionName },
        }),
    ]),
  ) as Record<
    AllStandardPermissionFlagDefinitionName,
    (
      args: Omit<CreateStandardPermissionFlagDefinitionArgs, 'context'>,
    ) => ReturnType<typeof createStandardPermissionFlagDefinitionFlatMetadata>
  >;
