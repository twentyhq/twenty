import { msg } from '@lingui/core/macro';

import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';
import {
  DateDisplayFormat,
  FieldMetadataType,
  RelationType,
} from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import {
  type CreateStandardFieldArgs,
  createStandardFieldFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/create-standard-field-flat-metadata.util';
import { createStandardRelationFieldFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/create-standard-relation-field-flat-metadata.util';

export const buildUnsubscribeTopicStandardFlatFieldMetadatas = ({
  now,
  objectName,
  workspaceId,
  standardObjectMetadataRelatedEntityIds,
  dependencyFlatEntityMaps,
  twentyStandardApplicationId,
}: Omit<
  CreateStandardFieldArgs<'unsubscribeTopic', FieldMetadataType>,
  'context'
>): Record<
  AllStandardObjectFieldName<'unsubscribeTopic'>,
  FlatFieldMetadata
> => {
  const base = {
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
    objectName,
    workspaceId,
  };

  return {
    id: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'id',
        type: FieldMetadataType.UUID,
        label: i18nLabel(msg`Id`),
        description: i18nLabel(msg`Id`),
        icon: 'Icon123',
        isSystem: true,
        isNullable: false,
        isUIEditable: false,
        defaultValue: 'uuid',
      },
    }),
    createdAt: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'createdAt',
        type: FieldMetadataType.DATE_TIME,
        label: i18nLabel(msg`Creation date`),
        description: i18nLabel(msg`Creation date`),
        icon: 'IconCalendar',
        isSystem: true,
        isNullable: false,
        isUIEditable: false,
        defaultValue: 'now',
        settings: { displayFormat: DateDisplayFormat.RELATIVE },
      },
    }),
    updatedAt: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'updatedAt',
        type: FieldMetadataType.DATE_TIME,
        label: i18nLabel(msg`Last update`),
        description: i18nLabel(msg`Last time the record was changed`),
        icon: 'IconCalendarClock',
        isSystem: true,
        isNullable: false,
        isUIEditable: false,
        defaultValue: 'now',
        settings: { displayFormat: DateDisplayFormat.RELATIVE },
      },
    }),
    deletedAt: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'deletedAt',
        type: FieldMetadataType.DATE_TIME,
        label: i18nLabel(msg`Deleted at`),
        description: i18nLabel(msg`Date when the record was deleted`),
        icon: 'IconCalendarMinus',
        isSystem: true,
        isNullable: true,
        isUIEditable: false,
        settings: { displayFormat: DateDisplayFormat.RELATIVE },
      },
    }),
    createdBy: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'createdBy',
        type: FieldMetadataType.ACTOR,
        label: i18nLabel(msg`Created by`),
        description: i18nLabel(msg`The creator of the record`),
        icon: 'IconCreativeCommonsSa',
        isSystem: true,
        isUIEditable: false,
        isNullable: false,
        defaultValue: {
          source: "'MANUAL'",
          name: "'System'",
          workspaceMemberId: null,
        },
      },
    }),
    updatedBy: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'updatedBy',
        type: FieldMetadataType.ACTOR,
        label: i18nLabel(msg`Updated by`),
        description: i18nLabel(
          msg`The workspace member who last updated the record`,
        ),
        icon: 'IconUserCircle',
        isSystem: true,
        isUIEditable: false,
        isNullable: false,
        defaultValue: {
          source: "'MANUAL'",
          name: "'System'",
          workspaceMemberId: null,
        },
      },
    }),
    position: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'position',
        type: FieldMetadataType.POSITION,
        label: i18nLabel(msg`Position`),
        description: i18nLabel(msg`Unsubscribe topic record position`),
        icon: 'IconHierarchy2',
        isSystem: true,
        isNullable: false,
        defaultValue: 0,
      },
    }),
    name: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'name',
        type: FieldMetadataType.TEXT,
        label: i18nLabel(msg`Name`),
        description: i18nLabel(msg`The unsubscribe topic name`),
        icon: 'IconMailbox',
        isNullable: true,
      },
    }),
    description: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'description',
        type: FieldMetadataType.TEXT,
        label: i18nLabel(msg`Description`),
        description: i18nLabel(msg`What recipients are unsubscribing from`),
        icon: 'IconFileText',
        isNullable: true,
      },
    }),
    visibility: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'visibility',
        type: FieldMetadataType.SELECT,
        label: i18nLabel(msg`Visibility`),
        description: i18nLabel(msg`Whether recipients can see this topic`),
        icon: 'IconEye',
        isNullable: false,
        defaultValue: "'PRIVATE'",
        options: [
          {
            id: 'e08bbdc0-3aa4-4f69-8578-200601601069',
            value: 'PUBLIC',
            label: i18nLabel(msg`Public`),
            position: 0,
            color: 'green',
          },
          {
            id: '1bbb89ad-987d-4883-848b-ab5aacf67058',
            value: 'PRIVATE',
            label: i18nLabel(msg`Private`),
            position: 1,
            color: 'gray',
          },
        ],
      },
    }),
    searchVector: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'searchVector',
        type: FieldMetadataType.TS_VECTOR,
        label: i18nLabel(msg`Search vector`),
        description: i18nLabel(msg`Field used for full-text search`),
        icon: 'IconMailbox',
        isSystem: true,
        isNullable: true,
      },
    }),
  };
};
