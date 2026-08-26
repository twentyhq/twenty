import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
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
  return Object.fromEntries(
    ORM_FLAT_FIELD_METADATA_KEYS.map((key) => [
      key,
      key === 'isUnique' ? isUnique : entity[key],
    ]),
  ) as OrmFlatFieldMetadata;
};
