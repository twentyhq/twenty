import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { fromEntityToScalarEntity } from 'src/engine/metadata-modules/flat-entity/utils/from-entity-to-scalar-entity.util';
import {
  ORM_FLAT_FIELD_METADATA_KEYS,
  type OrmFlatFieldMetadata,
} from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';

export const fromFieldMetadataEntityToOrmFlatFieldMetadata = ({
  entity,
  isUnique,
}: {
  entity: FieldMetadataEntity;
  isUnique: boolean;
}): OrmFlatFieldMetadata => {
  const scalar = fromEntityToScalarEntity({
    metadataName: 'fieldMetadata',
    entity,
  });

  return Object.fromEntries(
    ORM_FLAT_FIELD_METADATA_KEYS.map((key) => [
      key,
      key === 'isUnique' ? isUnique : scalar[key],
    ]),
  ) as OrmFlatFieldMetadata;
};
