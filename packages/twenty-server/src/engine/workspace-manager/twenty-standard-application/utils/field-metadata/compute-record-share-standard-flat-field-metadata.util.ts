import { msg } from '@lingui/core/macro';
import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';
import {
  DateDisplayFormat,
  FieldMetadataType,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import {
  type CreateStandardFieldArgs,
  createStandardFieldFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/create-standard-field-flat-metadata.util';

export const buildRecordShareStandardFlatFieldMetadatas = ({
  now,
  objectName,
  workspaceId,
  standardObjectMetadataRelatedEntityIds,
  dependencyFlatEntityMaps,
  twentyStandardApplicationId,
}: Omit<
  CreateStandardFieldArgs<'recordShare', FieldMetadataType>,
  'context'
>): Record<AllStandardObjectFieldName<'recordShare'>, FlatFieldMetadata> => ({
  id: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'id',
      type: FieldMetadataType.UUID,
      label: i18nLabel(msg({ message: `Id`, context: 'fieldMetadata.label' })),
      description: i18nLabel(
        msg({ message: `Id`, context: 'fieldMetadata.description' }),
      ),
      icon: 'Icon123',
      isSystem: true,
      isNullable: false,
      isUIEditable: false,
      defaultValue: 'uuid',
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  createdAt: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'createdAt',
      type: FieldMetadataType.DATE_TIME,
      label: i18nLabel(
        msg({ message: `Creation date`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({ message: `Creation date`, context: 'fieldMetadata.description' }),
      ),
      icon: 'IconCalendar',
      isSystem: true,
      isNullable: false,
      isUIEditable: false,
      defaultValue: 'now',
      settings: { displayFormat: DateDisplayFormat.RELATIVE },
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  updatedAt: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'updatedAt',
      type: FieldMetadataType.DATE_TIME,
      label: i18nLabel(
        msg({ message: `Last update`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Last time the record was changed`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconCalendarClock',
      isSystem: true,
      isNullable: false,
      isUIEditable: false,
      defaultValue: 'now',
      settings: { displayFormat: DateDisplayFormat.RELATIVE },
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  deletedAt: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'deletedAt',
      type: FieldMetadataType.DATE_TIME,
      label: i18nLabel(
        msg({ message: `Deleted at`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Date when the record was deleted`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconCalendarMinus',
      isSystem: true,
      isNullable: true,
      isUIEditable: false,
      settings: { displayFormat: DateDisplayFormat.RELATIVE },
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  recordId: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'recordId',
      type: FieldMetadataType.UUID,
      label: i18nLabel(
        msg({ message: `Record ID`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Shared record`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconAbc',
      isSystem: true,
      isNullable: false,
      isUIEditable: false,
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  objectMetadataId: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'objectMetadataId',
      type: FieldMetadataType.UUID,
      label: i18nLabel(
        msg({ message: `Object metadata ID`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Object of the shared record`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconAbc',
      isSystem: true,
      isNullable: false,
      isUIEditable: false,
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  principalId: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'principalId',
      type: FieldMetadataType.UUID,
      label: i18nLabel(
        msg({ message: `Principal ID`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Who receives the access`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconAbc',
      isSystem: true,
      isNullable: false,
      isUIEditable: false,
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  principalType: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'principalType',
      type: FieldMetadataType.SELECT,
      label: i18nLabel(
        msg({ message: `Principal type`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Kind of principal receiving the access`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconUsers',
      isSystem: true,
      isNullable: false,
      isUIEditable: false,
      options: [
        {
          id: '9a4c4d0b-14f7-4732-a435-c5e24a10ff04',
          value: RecordSharePrincipalType.EVERYONE,
          label: i18nLabel(
            msg({ message: `Everyone`, context: 'fieldMetadata.label' }),
          ),
          position: 0,
          color: 'green',
        },
        {
          id: 'be27402b-d26e-4609-8405-86a45a8f9500',
          value: RecordSharePrincipalType.WORKSPACE_MEMBER,
          label: i18nLabel(
            msg({
              message: `Workspace member`,
              context: 'fieldMetadata.label',
            }),
          ),
          position: 1,
          color: 'blue',
        },
        {
          id: '2a82dc80-3c8d-4e6c-918e-0cb868834e51',
          value: RecordSharePrincipalType.ROLE,
          label: i18nLabel(
            msg({ message: `Role`, context: 'fieldMetadata.label' }),
          ),
          position: 2,
          color: 'purple',
        },
      ],
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  accessLevel: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'accessLevel',
      type: FieldMetadataType.SELECT,
      label: i18nLabel(
        msg({ message: `Access level`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `What the principal may do with the record`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconLock',
      isSystem: true,
      isNullable: false,
      isUIEditable: false,
      options: [
        {
          id: 'bced0629-b044-40b2-9d89-d19f30caba50',
          value: RecordShareAccessLevel.READ,
          label: i18nLabel(
            msg({ message: `Read`, context: 'fieldMetadata.label' }),
          ),
          position: 0,
          color: 'sky',
        },
        {
          id: '45f2d2a8-28d2-449a-bba0-0433b5da2c17',
          value: RecordShareAccessLevel.READ_WRITE,
          label: i18nLabel(
            msg({ message: `Read and write`, context: 'fieldMetadata.label' }),
          ),
          position: 1,
          color: 'blue',
        },
        {
          id: '64ee2bb2-4c31-4944-b35c-75a993cb345f',
          value: RecordShareAccessLevel.FULL,
          label: i18nLabel(
            msg({ message: `Full`, context: 'fieldMetadata.label' }),
          ),
          position: 2,
          color: 'purple',
        },
      ],
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  rowCause: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'rowCause',
      type: FieldMetadataType.SELECT,
      label: i18nLabel(
        msg({ message: `Row cause`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Why the access was granted`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconHistory',
      isSystem: true,
      isNullable: false,
      isUIEditable: false,
      options: [
        {
          id: 'eb280688-c181-4e68-a61f-9d227e8be3f9',
          value: RecordShareRowCause.OWNER,
          label: i18nLabel(
            msg({ message: `Owner`, context: 'fieldMetadata.label' }),
          ),
          position: 0,
          color: 'green',
        },
        {
          id: '09dcbe18-af99-40fe-a24b-fea0d20563aa',
          value: RecordShareRowCause.MANUAL,
          label: i18nLabel(
            msg({ message: `Manual`, context: 'fieldMetadata.label' }),
          ),
          position: 1,
          color: 'blue',
        },
        {
          id: '60cb2015-6762-4a64-a400-68262eeb3b76',
          value: RecordShareRowCause.RULE,
          label: i18nLabel(
            msg({ message: `Rule`, context: 'fieldMetadata.label' }),
          ),
          position: 2,
          color: 'orange',
        },
        {
          id: '427a975f-b87d-4b3d-a366-5cf4e6c43b90',
          value: RecordShareRowCause.APPLICATION,
          label: i18nLabel(
            msg({ message: `Application`, context: 'fieldMetadata.label' }),
          ),
          position: 3,
          color: 'gray',
        },
      ],
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  sourceId: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'sourceId',
      type: FieldMetadataType.UUID,
      label: i18nLabel(
        msg({ message: `Source ID`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Owner, sharing rule or application that granted the access`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconAbc',
      isSystem: true,
      isNullable: false,
      isUIEditable: false,
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  createdBy: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'createdBy',
      type: FieldMetadataType.ACTOR,
      label: i18nLabel(
        msg({ message: `Created by`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `The creator of the record`,
          context: 'fieldMetadata.description',
        }),
      ),
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
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  updatedBy: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'updatedBy',
      type: FieldMetadataType.ACTOR,
      label: i18nLabel(
        msg({ message: `Updated by`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `The workspace member who last updated the record`,
          context: 'fieldMetadata.description',
        }),
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
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  position: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'position',
      type: FieldMetadataType.POSITION,
      label: i18nLabel(
        msg({ message: `Position`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Record share position`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconHierarchy2',
      isSystem: true,
      isNullable: false,
      defaultValue: 0,
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  searchVector: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'searchVector',
      type: FieldMetadataType.TS_VECTOR,
      label: i18nLabel(
        msg({ message: `Search vector`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Field used for full-text search`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconUser',
      isSystem: true,
      isNullable: true,
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
});
