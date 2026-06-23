import { isDefined, removePropertiesFromRecord } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { fromEntityToScalarEntity } from 'src/engine/metadata-modules/flat-entity/utils/from-entity-to-scalar-entity.util';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

type FromIndexMetadataEntityToFlatIndexMetadataArgs =
  FromEntityToFlatEntityArgs<'index'> & {
    fieldMetadataIdToUniversalIdentifierMap: Map<string, string>;
  };

export const fromIndexMetadataEntityToFlatIndexMetadata = (
  args: FromIndexMetadataEntityToFlatIndexMetadataArgs,
): FlatIndexMetadata => {
  const {
    entity: indexMetadataEntity,
    fieldMetadataIdToUniversalIdentifierMap,
  } = args;

  const indexMetadataEntityWithoutRelations = fromEntityToScalarEntity({
    metadataName: 'index',
    entity: indexMetadataEntity,
  });

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'index',
      ...args,
    });

  return {
    ...indexMetadataEntityWithoutRelations,
    ...relationUniversalIdentifiers,
    flatIndexFieldMetadatas: indexMetadataEntity.indexFieldMetadatas.map(
      (indexFieldMetadata) => ({
        ...removePropertiesFromRecord(indexFieldMetadata, [
          'indexMetadata',
          'fieldMetadata',
        ]),
        createdAt: indexFieldMetadata.createdAt.toISOString(),
        updatedAt: indexFieldMetadata.updatedAt.toISOString(),
        workspaceId: indexFieldMetadata.workspaceId,
      }),
    ),
    universalFlatIndexFieldMetadatas:
      indexMetadataEntity.indexFieldMetadatas.map((indexFieldMetadata) => {
        const fieldMetadataUniversalIdentifier =
          fieldMetadataIdToUniversalIdentifierMap.get(
            indexFieldMetadata.fieldMetadataId,
          );

        if (!isDefined(fieldMetadataUniversalIdentifier)) {
          throw new FlatEntityMapsException(
            `FieldMetadata with id ${indexFieldMetadata.fieldMetadataId} not found for index field metadata ${indexFieldMetadata.id}`,
            FlatEntityMapsExceptionCode.RELATION_UNIVERSAL_IDENTIFIER_NOT_FOUND,
          );
        }

        return {
          order: indexFieldMetadata.order,
          subFieldName: indexFieldMetadata.subFieldName,
          createdAt: indexFieldMetadata.createdAt.toISOString(),
          updatedAt: indexFieldMetadata.updatedAt.toISOString(),
          indexMetadataUniversalIdentifier:
            indexMetadataEntity.universalIdentifier,
          fieldMetadataUniversalIdentifier,
        };
      }),
  };
};
