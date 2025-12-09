import { msg } from '@lingui/core/macro';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type ViewDefinition } from 'src/engine/workspace-manager/standard-objects-prefill-data/types/view-definition.interface';
import { DEFAULT_VIEW_FIELD_SIZE } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/constants/DEFAULT_VIEW_FIELD_SIZE';
import { STANDARD_OBJECTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-object.constant';
import {
  BASE_OBJECT_STANDARD_FIELD_IDS,
  MESSAGE_THREAD_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';

export const messageThreadsAllView = ({
  objectMetadataItems,
  twentyStandardFlatApplication,
  useCoreNaming,
}: {
  objectMetadataItems: ObjectMetadataEntity[];
  useCoreNaming?: boolean;
  twentyStandardFlatApplication: FlatApplication;
}): ViewDefinition => {
  const messageThreadObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === STANDARD_OBJECT_IDS.messageThread,
  );

  if (!messageThreadObjectMetadata) {
    throw new Error('MessageThread object metadata not found');
  }

  const viewUniversalIdentifier =
    STANDARD_OBJECTS.messageThread.views.allMessageThreads.universalIdentifier;

  return {
    id: v4(),
    universalIdentifier: viewUniversalIdentifier,
    applicationId: twentyStandardFlatApplication.id,
    name: useCoreNaming ? msg`All {objectLabelPlural}` : 'All Message Threads',
    objectMetadataId: messageThreadObjectMetadata.id ?? '',
    type: 'table',
    key: 'INDEX',
    position: 0,
    icon: 'IconList',
    filters: [],
    fields: [
      {
        fieldMetadataId:
          messageThreadObjectMetadata.fields.find(
            (field) =>
              field.standardId === MESSAGE_THREAD_STANDARD_FIELD_IDS.messages,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: DEFAULT_VIEW_FIELD_SIZE,
        universalIdentifier:
          STANDARD_OBJECTS.messageThread.views.allMessageThreads.viewFields
            .messages.universalIdentifier,
      },
      {
        fieldMetadataId:
          messageThreadObjectMetadata.fields.find(
            (field) =>
              field.standardId === BASE_OBJECT_STANDARD_FIELD_IDS.createdAt,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 150,
        universalIdentifier:
          STANDARD_OBJECTS.messageThread.views.allMessageThreads.viewFields
            .createdAt.universalIdentifier,
      },
    ],
  };
};
