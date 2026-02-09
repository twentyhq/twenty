import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-universal-identifier-in-universal-flat-entity-maps-or-throw.util';
import {
  type FlatIndexFieldMetadata,
  type FlatIndexMetadata,
} from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { generateFlatIndexMetadataWithNameOrThrow } from 'src/engine/metadata-modules/index-metadata/utils/generate-flat-index.util';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import { type AllStandardObjectIndexName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-index-name.type';
import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';
import { type StandardBuilderArgs } from 'src/engine/workspace-manager/twenty-standard-application/types/metadata-standard-buillder-args.type';
import { type UniversalFlatIndexFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-index-metadata.type';

export type CreateStandardIndexOptions<O extends AllStandardObjectName> = {
  indexName: AllStandardObjectIndexName<O>;
  relatedFieldNames: AllStandardObjectFieldName<O>[];
} & Partial<
  Pick<FlatIndexMetadata, 'indexType' | 'indexWhereClause' | 'isUnique'>
>;

export type CreateStandardIndexArgs<
  O extends AllStandardObjectName = AllStandardObjectName,
> = StandardBuilderArgs<'index'> & {
  objectName: O;
  context: CreateStandardIndexOptions<O>;
};

export const createStandardIndexFlatMetadata = <
  O extends AllStandardObjectName,
>({
  workspaceId,
  objectName,
  context: {
    indexName,
    relatedFieldNames,
    indexType = IndexType.BTREE,
    indexWhereClause = null,
    isUnique = false,
  },
  standardObjectMetadataRelatedEntityIds,
  dependencyFlatEntityMaps: { flatFieldMetadataMaps, flatObjectMetadataMaps },
  twentyStandardApplicationId,
  now,
}: CreateStandardIndexArgs<O>): FlatIndexMetadata => {
  const objectIndexes = STANDARD_OBJECTS[objectName].indexes;

  if (!isDefined(objectIndexes)) {
    throw new Error(
      `Invalid index configuration ${objectName} ${indexName.toString()}`,
    );
  }
  // @ts-expect-error ignore
  const indexDefinition = objectIndexes[indexName] as unknown as {
    universalIdentifier: string;
  };

  const objectFields = STANDARD_OBJECTS[objectName].fields;

  const objectMetadataId =
    standardObjectMetadataRelatedEntityIds[objectName].id;
  const relatedFieldIds = relatedFieldNames.map(
    (fieldName) =>
      standardObjectMetadataRelatedEntityIds[objectName].fields[fieldName].id,
  );

  const objectMetadataUniversalIdentifier =
    STANDARD_OBJECTS[objectName].universalIdentifier;
  const flatObjectMetadata = findFlatEntityByUniversalIdentifierOrThrow({
    universalIdentifier: objectMetadataUniversalIdentifier,
    flatEntityMaps: flatObjectMetadataMaps,
  });

  const relatedFieldUniversalIdentifiers = relatedFieldNames.map(
    (fieldName) =>
      objectFields[fieldName as keyof typeof objectFields].universalIdentifier,
  );
  const flatFieldMetadatas =
    findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMapsOrThrow({
      universalIdentifiers: relatedFieldUniversalIdentifiers,
      flatEntityMaps: flatFieldMetadataMaps,
    });

  const indexId = v4();

  const unviersalFlatIndex = generateFlatIndexMetadataWithNameOrThrow({
    flatIndex: {
      createdAt: now,
      applicationUniversalIdentifier:
        TWENTY_STANDARD_APPLICATION.universalIdentifier,
      indexType,
      indexWhereClause,
      isCustom: false,
      isUnique,
      objectMetadataUniversalIdentifier: flatObjectMetadata.universalIdentifier,
      universalIdentifier: indexDefinition.universalIdentifier,
      updatedAt: now,
      universalFlatIndexFieldMetadatas:
        flatFieldMetadatas.map<UniversalFlatIndexFieldMetadata>(
          (
            { universalIdentifier: fieldMetadataUniversalIdentifier },
            index,
          ) => ({
            createdAt: now,
            order: index,
            updatedAt: now,
            fieldMetadataUniversalIdentifier,
            indexMetadataUniversalIdentifier:
              indexDefinition.universalIdentifier,
          }),
        ),
    },
    flatObjectMetadata,
    objectFlatFieldMetadatas: flatFieldMetadatas,
  });

  return {
    ...unviersalFlatIndex,
    applicationId: twentyStandardApplicationId,
    id: v4(),
    flatIndexFieldMetadatas: relatedFieldIds.map<FlatIndexFieldMetadata>(
      (fieldMetadataId, index) => ({
        createdAt: now,
        fieldMetadataId,
        id: v4(),
        indexMetadataId: indexId,
        order: index,
        updatedAt: now,
      }),
    ),
    workspaceId,
    objectMetadataId,
  };
};
