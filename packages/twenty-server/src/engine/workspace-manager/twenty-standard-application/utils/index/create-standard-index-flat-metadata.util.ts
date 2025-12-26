import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import {
  type FlatIndexFieldMetadata,
  type FlatIndexMetadata,
} from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { generateFlatIndexMetadataWithNameOrThrow } from 'src/engine/metadata-modules/index-metadata/utils/generate-flat-index.util';
import { STANDARD_OBJECTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-object.constant';
import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import { type AllStandardObjectIndexName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-index-name.type';
import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';
import { type StandardBuilderArgs } from 'src/engine/workspace-manager/twenty-standard-application/types/metadata-standard-buillder-args.type';

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

  const objectMetadataId =
    standardObjectMetadataRelatedEntityIds[objectName].id;
  const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
    flatEntityId: objectMetadataId,
    flatEntityMaps: flatObjectMetadataMaps,
  });

  const relatedFieldIds = relatedFieldNames.map(
    (fieldName) =>
      standardObjectMetadataRelatedEntityIds[objectName].fields[fieldName].id,
  );
  const flatFieldMetadatas = findManyFlatEntityByIdInFlatEntityMapsOrThrow({
    flatEntityIds: relatedFieldIds,
    flatEntityMaps: flatFieldMetadataMaps,
  });

  const indexId = v4();

  return generateFlatIndexMetadataWithNameOrThrow({
    flatIndex: {
      createdAt: now,
      applicationId: twentyStandardApplicationId,
      indexType,
      indexWhereClause,
      isCustom: false,
      isUnique,
      objectMetadataId,
      universalIdentifier: indexDefinition.universalIdentifier,
      updatedAt: now,
      workspaceId,
      id: indexId,
      flatIndexFieldMetadatas: flatFieldMetadatas.map<FlatIndexFieldMetadata>(
        ({ id: fieldMetadataId }, index) => ({
          createdAt: now,
          fieldMetadataId,
          id: v4(),
          indexMetadataId: indexId,
          order: index,
          updatedAt: now,
        }),
      ),
    },
    flatObjectMetadata,
    objectFlatFieldMetadatas: flatFieldMetadatas,
  });
};
