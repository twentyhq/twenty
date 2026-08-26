import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { fromEntityToScalarEntity } from 'src/engine/metadata-modules/flat-entity/utils/from-entity-to-scalar-entity.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';

// Builds only the scalar columns the record query path needs, skipping the relation-id arrays,
// universal-identifier twins and universalSettings that the full flat builder attaches. isUnique
// is not a stored column — it is derived from the workspace unique indexes, same as the full path.
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

  return {
    ...scalar,
    isUnique,
  };
};
