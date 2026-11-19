import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { WORKSPACE_OWNED_PROPERTIES_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/workspace-owned-properties-by-metadata-name.constant';

export const pickWorkspaceOwnedProperties = ({
  metadataName,
  flatEntity,
}: {
  metadataName: AllMetadataName;
  flatEntity: object;
}): Record<string, unknown> => {
  const workspaceOwnedProperties: ReadonlySet<string> = new Set(
    WORKSPACE_OWNED_PROPERTIES_BY_METADATA_NAME[metadataName] ?? [],
  );

  return Object.fromEntries(
    Object.entries(flatEntity).filter(
      ([property, value]) =>
        workspaceOwnedProperties.has(property) && isDefined(value),
    ),
  );
};
