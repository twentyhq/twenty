import { msg } from '@lingui/core/macro';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type ViewDefinition } from 'src/engine/workspace-manager/standard-objects-prefill-data/types/view-definition.interface';
import { STANDARD_OBJECTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-object.constant';
import {
  BASE_OBJECT_STANDARD_FIELD_IDS,
  NOTE_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';

export const notesAllView = ({
  objectMetadataItems,
  useCoreNaming = false,
  twentyStandardFlatApplication,
}: {
  objectMetadataItems: ObjectMetadataEntity[];
  useCoreNaming?: boolean;
  twentyStandardFlatApplication: FlatApplication;
}): ViewDefinition => {
  const noteObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === STANDARD_OBJECT_IDS.note,
  );

  if (!noteObjectMetadata) {
    throw new Error('Note object metadata not found');
  }

  const viewUniversalIdentifier =
    STANDARD_OBJECTS.note.views.allNotes.universalIdentifier;

  return {
    id: v4(),
    universalIdentifier: viewUniversalIdentifier,
    applicationId: twentyStandardFlatApplication.id,
    name: useCoreNaming ? msg`All {objectLabelPlural}` : 'All Notes',
    objectMetadataId: noteObjectMetadata.id,
    type: 'table',
    key: 'INDEX',
    position: 0,
    icon: 'IconNotes',
    filters: [],
    fields: [
      {
        fieldMetadataId:
          noteObjectMetadata.fields.find(
            (field) => field.standardId === NOTE_STANDARD_FIELD_IDS.title,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 210,
        universalIdentifier:
          STANDARD_OBJECTS.note.views.allNotes.viewFields.title
            .universalIdentifier,
      },
      {
        fieldMetadataId:
          noteObjectMetadata.fields.find(
            (field) => field.standardId === NOTE_STANDARD_FIELD_IDS.noteTargets,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 150,
        universalIdentifier:
          STANDARD_OBJECTS.note.views.allNotes.viewFields.noteTargets
            .universalIdentifier,
      },
      {
        fieldMetadataId:
          noteObjectMetadata.fields.find(
            (field) => field.standardId === NOTE_STANDARD_FIELD_IDS.bodyV2,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 150,
        universalIdentifier:
          STANDARD_OBJECTS.note.views.allNotes.viewFields.bodyV2
            .universalIdentifier,
      },
      {
        fieldMetadataId:
          noteObjectMetadata.fields.find(
            (field) => field.standardId === NOTE_STANDARD_FIELD_IDS.createdBy,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 150,
        universalIdentifier:
          STANDARD_OBJECTS.note.views.allNotes.viewFields.createdBy
            .universalIdentifier,
      },
      {
        fieldMetadataId:
          noteObjectMetadata.fields.find(
            (field) =>
              field.standardId === BASE_OBJECT_STANDARD_FIELD_IDS.createdAt,
          )?.id ?? '',
        position: 4,
        isVisible: true,
        size: 150,
        universalIdentifier:
          STANDARD_OBJECTS.note.views.allNotes.viewFields.createdAt
            .universalIdentifier,
      },
      /*
      TODO: Add later, since we don't have real-time it probably doesn't work well?
      {
        fieldMetadataId:
          objectMetadataMap[STANDARD_OBJECT_IDS.note].fields[.updatedAt
          ],
        position: 0,
        isVisible: true,
        size: 210},
      */
    ],
  };
};
