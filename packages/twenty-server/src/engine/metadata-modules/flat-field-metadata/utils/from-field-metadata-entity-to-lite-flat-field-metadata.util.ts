import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type MetadataEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-entity.type';
import { fromEntityToScalarEntity } from 'src/engine/metadata-modules/flat-entity/utils/from-entity-to-scalar-entity.util';
import { type LiteFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/lite-flat-field-metadata.type';
import { type EntityWithRegroupedOneToManyRelations } from 'src/engine/workspace-cache/types/entity-with-regrouped-one-to-many-relations.type';

// Builds only the scalar columns the record query path needs, skipping the relation-id arrays,
// universal-identifier twins and universalSettings that the full flat builder attaches. isUnique
// is not a stored column — it is derived from the workspace unique indexes, same as the full path.
export const fromFieldMetadataEntityToLiteFlatFieldMetadata = ({
  entity,
  isUnique,
}: {
  entity: FieldMetadataEntity;
  isUnique: boolean;
}): LiteFlatFieldMetadata => {
  const scalar = fromEntityToScalarEntity({
    metadataName: 'fieldMetadata',
    entity: entity as EntityWithRegroupedOneToManyRelations<
      MetadataEntity<'fieldMetadata'>
    >,
  });

  return {
    ...scalar,
    isUnique,
  } as LiteFlatFieldMetadata;
};
