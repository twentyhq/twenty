import { isDefined } from 'twenty-shared/utils';

import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type OwnerField = {
  name: string;
  joinColumnName: string;
};

export const findOwnerField = ({
  flatObjectMetadata,
  flatFieldMetadataMaps,
}: {
  flatObjectMetadata: Pick<FlatObjectMetadata, 'ownerFieldMetadataId'>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): OwnerField | undefined => {
  if (!isDefined(flatObjectMetadata.ownerFieldMetadataId)) {
    return undefined;
  }

  const ownerFlatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityMaps: flatFieldMetadataMaps,
    flatEntityId: flatObjectMetadata.ownerFieldMetadataId,
  });

  return isDefined(ownerFlatFieldMetadata)
    ? {
        name: ownerFlatFieldMetadata.name,
        joinColumnName: computeMorphOrRelationFieldJoinColumnName({
          name: ownerFlatFieldMetadata.name,
        }),
      }
    : undefined;
};
