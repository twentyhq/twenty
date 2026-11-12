import { fromEntityToScalarEntity } from 'src/engine/metadata-modules/flat-entity/utils/from-entity-to-scalar-entity.util';
import { type FlatFieldMetadataOption } from 'src/engine/metadata-modules/flat-field-metadata-option/types/flat-field-metadata-option.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromFieldMetadataOptionEntityToFlatFieldMetadataOption = (
  args: FromEntityToFlatEntityArgs<'fieldMetadataOption'>,
): FlatFieldMetadataOption => {
  const { entity: fieldMetadataOptionEntity } = args;

  const fieldMetadataOptionScalarEntity = fromEntityToScalarEntity({
    metadataName: 'fieldMetadataOption',
    entity: fieldMetadataOptionEntity,
  });

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'fieldMetadataOption',
      ...args,
    });

  return {
    ...fieldMetadataOptionScalarEntity,
    ...relationUniversalIdentifiers,
  };
};
