import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { type AllStandardObjectIndexName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-index-name.type';
import {
  type CreateStandardIndexArgs,
  createStandardIndexFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/index/create-standard-index-flat-metadata.util';

export const buildCompanyStandardFlatIndexMetadatas = ({
  now,
  objectName,
  workspaceId,
  workspaceTwentyStandardApplicationId,
  standardFieldMetadataIdByObjectAndFieldName,
  dependencyFlatEntityMaps,
}: Omit<CreateStandardIndexArgs<'company'>, 'options'>): Record<
  AllStandardObjectIndexName<'company'>,
  FlatIndexMetadata
> => ({
  accountOwnerIdIndex: createStandardIndexFlatMetadata({
    objectName,
    workspaceId,
    options: {
      indexName: 'accountOwnerIdIndex',
      relatedFieldNames: ['accountOwner'],
    },
    standardFieldMetadataIdByObjectAndFieldName,
    dependencyFlatEntityMaps,
    workspaceTwentyStandardApplicationId,
    now,
  }),
  domainNameUniqueIndex: createStandardIndexFlatMetadata({
    objectName,
    workspaceId,
    options: {
      indexName: 'domainNameUniqueIndex',
      relatedFieldNames: ['domainName'],
      isUnique: true,
    },
    standardFieldMetadataIdByObjectAndFieldName,
    dependencyFlatEntityMaps,
    workspaceTwentyStandardApplicationId,
    now,
  }),
  searchVectorGinIndex: createStandardIndexFlatMetadata({
    objectName,
    workspaceId,
    options: {
      indexName: 'searchVectorGinIndex',
      relatedFieldNames: ['searchVector'],
      indexType: IndexType.GIN,
    },
    standardFieldMetadataIdByObjectAndFieldName,
    dependencyFlatEntityMaps,
    workspaceTwentyStandardApplicationId,
    now,
  }),
});
