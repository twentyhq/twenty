import { ENGINE_OBJECT_ROW_ACCESS_POLICIES } from 'src/engine/engine-object-row-access-policies.constant';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type ObjectRowAccessPolicy } from 'src/engine/permissions/row-policy/types/object-row-access-policy.type';

export const getObjectRowAccessPolicy = (
  flatObjectMetadata: Pick<FlatObjectMetadata, 'universalIdentifier'>,
): ObjectRowAccessPolicy | undefined =>
  ENGINE_OBJECT_ROW_ACCESS_POLICIES.find(({ objectUniversalIdentifiers }) =>
    objectUniversalIdentifiers.includes(flatObjectMetadata.universalIdentifier),
  );
