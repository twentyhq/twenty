import { FieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import { createStandardFieldFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/create-standard-field-flat-metadata.util';
import { createStandardRelationFieldFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/create-standard-relation-field-flat-metadata.util';
import { type StandardFieldMetadataIdByObjectAndFieldName } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-field-metadata-id-by-object-and-field-name.util';

export const buildNoteTargetStandardFlatFieldMetadatas = ({
  createdAt,
  workspaceId,
  standardFieldMetadataIdByObjectAndFieldName,
}: {
  createdAt: Date;
  workspaceId: string;
  standardFieldMetadataIdByObjectAndFieldName: StandardFieldMetadataIdByObjectAndFieldName;
}): Record<AllStandardObjectFieldName<'noteTarget'>, FlatFieldMetadata> => ({
  // Base fields from BaseWorkspaceEntity
  id: createStandardFieldFlatMetadata({
    objectName: 'noteTarget',
    workspaceId,
    options: {
      fieldName: 'id',
      type: FieldMetadataType.UUID,
      label: 'Id',
      description: 'Id',
      icon: 'Icon123',
      isSystem: true,
      isNullable: false,
      isUIReadOnly: true,
      defaultValue: 'uuid',
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  createdAt: createStandardFieldFlatMetadata({
    objectName: 'noteTarget',
    workspaceId,
    options: {
      fieldName: 'createdAt',
      type: FieldMetadataType.DATE_TIME,
      label: 'Creation date',
      description: 'Creation date',
      icon: 'IconCalendar',
      isNullable: false,
      isUIReadOnly: true,
      defaultValue: 'now',
      settings: {
        displayFormat: 'RELATIVE',
      },
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  updatedAt: createStandardFieldFlatMetadata({
    objectName: 'noteTarget',
    workspaceId,
    options: {
      fieldName: 'updatedAt',
      type: FieldMetadataType.DATE_TIME,
      label: 'Last update',
      description: 'Last time the record was changed',
      icon: 'IconCalendarClock',
      isNullable: false,
      isUIReadOnly: true,
      defaultValue: 'now',
      settings: {
        displayFormat: 'RELATIVE',
      },
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  deletedAt: createStandardFieldFlatMetadata({
    objectName: 'noteTarget',
    workspaceId,
    options: {
      fieldName: 'deletedAt',
      type: FieldMetadataType.DATE_TIME,
      label: 'Deleted at',
      description: 'Date when the record was deleted',
      icon: 'IconCalendarMinus',
      isNullable: true,
      isUIReadOnly: true,
      settings: {
        displayFormat: 'RELATIVE',
      },
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),

  // Relation fields
  note: createStandardRelationFieldFlatMetadata({
    objectName: 'noteTarget',
    workspaceId,
    options: {
      fieldName: 'note',
      label: 'Note',
      description: 'NoteTarget note',
      icon: 'IconNotes',
      isNullable: true,
      createdAt,
      targetObjectName: 'note',
      targetFieldName: 'noteTargets',
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  person: createStandardRelationFieldFlatMetadata({
    objectName: 'noteTarget',
    workspaceId,
    options: {
      fieldName: 'person',
      label: 'Person',
      description: 'NoteTarget person',
      icon: 'IconUser',
      isNullable: true,
      createdAt,
      targetObjectName: 'person',
      targetFieldName: 'noteTargets',
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  company: createStandardRelationFieldFlatMetadata({
    objectName: 'noteTarget',
    workspaceId,
    options: {
      fieldName: 'company',
      label: 'Company',
      description: 'NoteTarget company',
      icon: 'IconBuildingSkyscraper',
      isNullable: true,
      createdAt,
      targetObjectName: 'company',
      targetFieldName: 'noteTargets',
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  opportunity: createStandardRelationFieldFlatMetadata({
    objectName: 'noteTarget',
    workspaceId,
    options: {
      fieldName: 'opportunity',
      label: 'Opportunity',
      description: 'NoteTarget opportunity',
      icon: 'IconTargetArrow',
      isNullable: true,
      createdAt,
      targetObjectName: 'opportunity',
      targetFieldName: 'noteTargets',
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  custom: createStandardRelationFieldFlatMetadata({
    objectName: 'noteTarget',
    workspaceId,
    options: {
      fieldName: 'custom',
      label: 'Custom',
      description: 'NoteTarget custom object',
      icon: 'IconBuildingSkyscraper',
      isNullable: true,
      createdAt,
      // Custom is a dynamic relation
      targetObjectName: 'note',
      targetFieldName: 'noteTargets',
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
});
