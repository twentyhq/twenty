import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type AllStandardObjectIndexName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-index-name.type';
import {
  type CreateStandardIndexArgs,
  createStandardIndexFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/index/create-standard-index-flat-metadata.util';

export const buildMessageChannelMessageASsociationMessageFolderStandardFlatIndexMetadatas =
  ({
    now,
    objectName,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
  }: Omit<
    CreateStandardIndexArgs<'messageChannelMessageASsociationMessageFolder'>,
    'context'
  >): Record<
    AllStandardObjectIndexName<'messageChannelMessageASsociationMessageFolder'>,
    FlatIndexMetadata
  > => ({
    messageChannelMessageASsociationIdIndex: createStandardIndexFlatMetadata({
      objectName,
      workspaceId,
      context: {
        indexName: 'messageChannelMessageASsociationIdIndex',
        relatedFieldNames: ['messageChannelMessageASsociation'],
      },
      standardObjectMetadataRelatedEntityIds,
      dependencyFlatEntityMaps,
      twentyStandardApplicationId,
      now,
    }),
    messageFolderIdIndex: createStandardIndexFlatMetadata({
      objectName,
      workspaceId,
      context: {
        indexName: 'messageFolderIdIndex',
        relatedFieldNames: ['messageFolderId'],
      },
      standardObjectMetadataRelatedEntityIds,
      dependencyFlatEntityMaps,
      twentyStandardApplicationId,
      now,
    }),
    messageChannelMessageASsociationIdMessageFolderIdUniqueIndex:
      createStandardIndexFlatMetadata({
        objectName,
        workspaceId,
        context: {
          indexName:
            'messageChannelMessageASsociationIdMessageFolderIdUniqueIndex',
          relatedFieldNames: [
            'messageChannelMessageASsociation',
            'messageFolderId',
          ],
          isUnique: true,
          indexWhereClause: '"deletedAt" IS NULL',
        },
        standardObjectMetadataRelatedEntityIds,
        dependencyFlatEntityMaps,
        twentyStandardApplicationId,
        now,
      }),
  });
