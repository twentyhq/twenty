import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type AllStandardObjectIndexName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-index-name.type';
import {
  type CreateStandardIndexArgs,
  createStandardIndexFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/index/create-standard-index-flat-metadata.util';

export const buildCallRecordingCalendarEventAssociationStandardFlatIndexMetadatas =
  ({
    now,
    objectName,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
  }: Omit<
    CreateStandardIndexArgs<'callRecordingCalendarEventAssociation'>,
    'context'
  >): Record<
    AllStandardObjectIndexName<'callRecordingCalendarEventAssociation'>,
    FlatIndexMetadata
  > => ({
    callRecordingIdIndex: createStandardIndexFlatMetadata({
      objectName,
      workspaceId,
      context: {
        indexName: 'callRecordingIdIndex',
        relatedFieldNames: ['callRecording'],
      },
      standardObjectMetadataRelatedEntityIds,
      dependencyFlatEntityMaps,
      twentyStandardApplicationId,
      now,
    }),
    calendarEventIdIndex: createStandardIndexFlatMetadata({
      objectName,
      workspaceId,
      context: {
        indexName: 'calendarEventIdIndex',
        relatedFieldNames: ['calendarEvent'],
      },
      standardObjectMetadataRelatedEntityIds,
      dependencyFlatEntityMaps,
      twentyStandardApplicationId,
      now,
    }),
  });
