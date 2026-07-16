import { msg } from '@lingui/core/macro';
import { DateDisplayFormat, FieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import {
  type CreateStandardFieldArgs,
  createStandardFieldFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/create-standard-field-flat-metadata.util';
import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';
import { ExternalSystem } from 'src/modules/executive-search/standard-objects/enums/external-system.enum';

export const buildExternalEntityLinkStandardFlatFieldMetadatas = ({
  now,
  objectName,
  workspaceId,
  standardObjectMetadataRelatedEntityIds,
  dependencyFlatEntityMaps,
  twentyStandardApplicationId,
}: Omit<
  CreateStandardFieldArgs<'externalEntityLink', FieldMetadataType>,
  'context'
>): Record<
  AllStandardObjectFieldName<'externalEntityLink'>,
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
        description: i18nLabel(msg`External entity link record position`),
        icon: 'IconHierarchy2',
        isSystem: true,
        isNullable: false,
        defaultValue: 0,
      },
    }),
    searchVector: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'searchVector',
        type: FieldMetadataType.TS_VECTOR,
        label: i18nLabel(msg`Search vector`),
        description: i18nLabel(msg`Field used for full-text search`),
        icon: 'IconUser',
        isSystem: true,
        isNullable: true,
      },
    }),
    externalSystem: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'externalSystem',
        type: FieldMetadataType.SELECT,
        label: i18nLabel(msg`External System`),
        description: i18nLabel(msg`External system identifier`),
        icon: 'IconPlug',
        isNullable: false,
        isUIEditable: false,
        defaultValue: `'${ExternalSystem.DIRECTUS}'`,
        options: [
          {
            id: '9db47557-044b-451c-b847-381f889459c3',
            value: ExternalSystem.DIRECTUS,
            label: i18nLabel(msg`Directus`),
            position: 0,
            color: 'green',
          },
        ],
      },
    }),
    externalCollection: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'externalCollection',
        type: FieldMetadataType.TEXT,
        label: i18nLabel(msg`External Collection`),
        description: i18nLabel(msg`External collection/table name`),
        icon: 'IconTable',
        isNullable: false,
        isUIEditable: false,
      },
    }),
    externalRecordId: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'externalRecordId',
        type: FieldMetadataType.TEXT,
        label: i18nLabel(msg`External Record ID`),
        description: i18nLabel(msg`External record identifier`),
        icon: 'IconId',
        isNullable: false,
        isUIEditable: false,
      },
    }),
    targetObjectMetadataId: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'targetObjectMetadataId',
        type: FieldMetadataType.UUID,
        label: i18nLabel(msg`Target Object`),
        description: i18nLabel(msg`Target object metadata identifier`),
        icon: 'IconBox',
        isNullable: false,
        isUIEditable: false,
      },
    }),
    targetRecordId: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'targetRecordId',
        type: FieldMetadataType.UUID,
        label: i18nLabel(msg`Target Record ID`),
        description: i18nLabel(msg`Target record identifier`),
        icon: 'IconId',
        isNullable: false,
        isUIEditable: false,
      },
    }),
    isActive: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'isActive',
        type: FieldMetadataType.BOOLEAN,
        label: i18nLabel(msg`Is Active`),
        description: i18nLabel(msg`Whether the link is active`),
        icon: 'IconActivity',
        isNullable: false,
        isUIEditable: false,
        defaultValue: true,
      },
    }),
    deactivatedAt: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'deactivatedAt',
        type: FieldMetadataType.DATE_TIME,
        label: i18nLabel(msg`Deactivated At`),
        description: i18nLabel(msg`When the link was deactivated`),
        icon: 'IconCalendarOff',
        isNullable: true,
        isUIEditable: false,
      },
    }),
  };
};
