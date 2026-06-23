import { getIndexUniversalIdentifier } from 'twenty-shared/application';

import { computeFlatIndexNameOrThrow } from 'src/engine/metadata-modules/index-metadata/utils/compute-flat-index-name.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-index-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

type FlatIndexWithoutDeterministicIdentifiers = Omit<
  UniversalFlatIndexMetadata,
  | 'name'
  | 'universalIdentifier'
  | 'objectMetadataUniversalIdentifier'
  | 'applicationUniversalIdentifier'
  | 'universalFlatIndexFieldMetadatas'
> & {
  universalFlatIndexFieldMetadatas: Array<
    Omit<
      UniversalFlatIndexMetadata['universalFlatIndexFieldMetadatas'][number],
      'indexMetadataUniversalIdentifier'
    >
  >;
};

export const generateFlatIndexMetadataWithDeterministicUniversalIdentifierOrThrow =
  ({
    flatObjectMetadata,
    objectFlatFieldMetadatas,
    flatIndex,
  }: {
    flatObjectMetadata: UniversalFlatObjectMetadata;
    objectFlatFieldMetadatas: UniversalFlatFieldMetadata[];
    flatIndex: FlatIndexWithoutDeterministicIdentifiers;
  }): UniversalFlatIndexMetadata => {
    const name = computeFlatIndexNameOrThrow({
      flatObjectMetadata,
      objectFlatFieldMetadatas,
      universalFlatIndexFieldMetadatas:
        flatIndex.universalFlatIndexFieldMetadatas,
      isUnique: flatIndex.isUnique,
      indexWhereClause: flatIndex.indexWhereClause,
    });

    const universalIdentifier = getIndexUniversalIdentifier({
      ownerApplicationUniversalIdentifier:
        flatObjectMetadata.applicationUniversalIdentifier,
      objectUniversalIdentifier: flatObjectMetadata.universalIdentifier,
      name,
    });

    return {
      ...flatIndex,
      name,
      universalIdentifier,
      objectMetadataUniversalIdentifier: flatObjectMetadata.universalIdentifier,
      applicationUniversalIdentifier:
        flatObjectMetadata.applicationUniversalIdentifier,
      universalFlatIndexFieldMetadatas:
        flatIndex.universalFlatIndexFieldMetadatas.map((indexField) => ({
          ...indexField,
          indexMetadataUniversalIdentifier: universalIdentifier,
        })),
    };
  };
