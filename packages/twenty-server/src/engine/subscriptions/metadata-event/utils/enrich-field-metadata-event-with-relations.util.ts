import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { resolveMorphRelationsFromFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/resolve-morph-relations-from-flat-field-metadata.util';
import { resolveRelationFromFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/resolve-relation-from-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

type EnrichFieldMetadataEventArgs = {
  record: Record<string, unknown>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
};

export const enrichFieldMetadataEventWithRelations = ({
  record,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
}: EnrichFieldMetadataEventArgs): Record<string, unknown> => {
  const flatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: record.id as string,
    flatEntityMaps: flatFieldMetadataMaps,
  });

  if (!isDefined(flatFieldMetadata)) {
    return record;
  }

  try {
    if (
      isFlatFieldMetadataOfType(flatFieldMetadata, FieldMetadataType.RELATION)
    ) {
      const relation = resolveRelationFromFlatFieldMetadata({
        sourceFlatFieldMetadata: flatFieldMetadata,
        flatFieldMetadataMaps,
        flatObjectMetadataMaps,
      });

      return isDefined(relation) ? { ...record, relation } : record;
    }

    if (
      isFlatFieldMetadataOfType(
        flatFieldMetadata,
        FieldMetadataType.MORPH_RELATION,
      )
    ) {
      const morphRelations = resolveMorphRelationsFromFlatFieldMetadata({
        morphFlatFieldMetadata: flatFieldMetadata,
        flatFieldMetadataMaps,
        flatObjectMetadataMaps,
      });

      return { ...record, morphRelations };
    }
  } catch {
    return record;
  }

  return record;
};
