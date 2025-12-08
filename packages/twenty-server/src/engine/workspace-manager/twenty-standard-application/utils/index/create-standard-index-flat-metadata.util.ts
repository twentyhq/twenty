import { v4 } from 'uuid';
import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
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
import { type StandardFieldMetadataIdByObjectAndFieldName } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-field-metadata-id-by-object-and-field-name.util';

export type CreateStandardIndexOptions<O extends AllStandardObjectName> = {
  indexName: AllStandardObjectIndexName<O>;
  relatedFieldNames: AllStandardObjectFieldName<O>[];
} & Partial<
  Pick<FlatIndexMetadata, 'indexType' | 'indexWhereClause' | 'isUnique'>
>;

export type CreateStandardIndexArgs<
  O extends AllStandardObjectName = AllStandardObjectName,
> = {
  objectName: O;
  workspaceId: string;
  options: CreateStandardIndexOptions<O>;
  standardFieldMetadataIdByObjectAndFieldName: StandardFieldMetadataIdByObjectAndFieldName;
  now: Date;
  workspaceTwentyStandardApplicationId: string;
  dependencyFlatEntityMaps: Pick<
    AllFlatEntityMaps,
    'flatFieldMetadataMaps' | 'flatObjectMetadataMaps'
  >;
};

export const createStandardIndexFlatMetadata = <
  O extends AllStandardObjectName,
>({
  objectName,
  workspaceId,
  options: {
    indexName,
    relatedFieldNames,
    indexType = IndexType.BTREE,
    indexWhereClause = null,
    isUnique = false,
  },
  standardFieldMetadataIdByObjectAndFieldName,
  dependencyFlatEntityMaps: { flatFieldMetadataMaps, flatObjectMetadataMaps },
  workspaceTwentyStandardApplicationId,
  now,
}: CreateStandardIndexArgs<O>): FlatIndexMetadata => {
  const objectIndexes = STANDARD_OBJECTS[objectName].indexes;

  if (!isDefined(objectIndexes)) {
    throw new Error(
      `Invalid index configuration ${objectName} ${indexName.toString()}`,
    );
  }
  // TODO investigate why never is pain here
  const indexDefinition = objectIndexes[indexName] as unknown as {
    universalIdentifier: string;
  };

  const objectMetadataId =
    standardFieldMetadataIdByObjectAndFieldName[objectName].id;
  const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
    flatEntityId: objectMetadataId,
    flatEntityMaps: flatObjectMetadataMaps,
  });

  const relatedFieldIds = relatedFieldNames.map(
    (fieldName) =>
      standardFieldMetadataIdByObjectAndFieldName[objectName].fields[fieldName],
  );
  const flatFieldMetadatas = findManyFlatEntityByIdInFlatEntityMapsOrThrow({
    flatEntityIds: relatedFieldIds,
    flatEntityMaps: flatFieldMetadataMaps,
  });

  const indexId = v4();

  return generateFlatIndexMetadataWithNameOrThrow({
    flatIndex: {
      createdAt: now,
      applicationId: workspaceTwentyStandardApplicationId,
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
