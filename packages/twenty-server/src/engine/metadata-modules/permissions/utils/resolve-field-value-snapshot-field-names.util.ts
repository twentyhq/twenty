import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { FIELD_VALUE_SNAPSHOT_FIELD_UNIVERSAL_IDENTIFIERS } from 'src/engine/metadata-modules/permissions/constants/field-value-snapshot-field-universal-identifiers.constant';

export const resolveFieldValueSnapshotFieldNames = ({
  objectMetadataId,
  flatFieldMetadataMaps,
}: {
  objectMetadataId: string;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): string[] =>
  [...FIELD_VALUE_SNAPSHOT_FIELD_UNIVERSAL_IDENTIFIERS].flatMap(
    (universalIdentifier) => {
      const flatFieldMetadata = findFlatEntityByUniversalIdentifier({
        universalIdentifier,
        flatEntityMaps: flatFieldMetadataMaps,
      });

      return flatFieldMetadata?.objectMetadataId === objectMetadataId
        ? [flatFieldMetadata.name]
        : [];
    },
  );
