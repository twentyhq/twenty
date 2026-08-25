import { msg } from '@lingui/core/macro';
import {
  DateDisplayFormat,
  FieldMetadataType,
  RelationOnDeleteAction,
  RelationType,
} from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import {
  type CreateStandardFieldArgs,
  createStandardFieldFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/create-standard-field-flat-metadata.util';
import { createStandardRelationFieldFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/create-standard-relation-field-flat-metadata.util';
import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';

type StandardTargetObjectName = 'calendarEventTarget' | 'messageThreadTarget';

type SharedStandardTargetFieldName = Exclude<
  AllStandardObjectFieldName<'calendarEventTarget'>,
  'calendarEvent'
> &
  Exclude<AllStandardObjectFieldName<'messageThreadTarget'>, 'messageThread'>;

type BuildStandardTargetFieldsArgs<T extends StandardTargetObjectName> = Omit<
  CreateStandardFieldArgs<T, FieldMetadataType>,
  'context'
> & {
  inverseTargetFieldName: 'calendarEventTargets' | 'messageThreadTargets';
  morphId: string;
};

export const buildStandardTargetFlatFieldMetadatas = <
  T extends StandardTargetObjectName,
>({
  objectName,
  inverseTargetFieldName,
  morphId,
  ...args
}: BuildStandardTargetFieldsArgs<T>): Record<
  SharedStandardTargetFieldName,
  FlatFieldMetadata
> => ({
  id: createStandardFieldFlatMetadata({
    ...args,
    objectName,
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
  }),
  createdAt: createStandardFieldFlatMetadata({
    ...args,
    objectName,
    context: {
      fieldName: 'createdAt',
      type: FieldMetadataType.DATE_TIME,
      label: i18nLabel(
        msg({ message: `Creation date`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Creation date`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconCalendar',
      isSystem: true,
      isNullable: false,
      isUIEditable: false,
      defaultValue: 'now',
      settings: { displayFormat: DateDisplayFormat.RELATIVE },
    },
  }),
  updatedAt: createStandardFieldFlatMetadata({
    ...args,
    objectName,
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
  }),
  deletedAt: createStandardFieldFlatMetadata({
    ...args,
    objectName,
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
  }),
  createdBy: createStandardFieldFlatMetadata({
    ...args,
    objectName,
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
  }),
  updatedBy: createStandardFieldFlatMetadata({
    ...args,
    objectName,
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
  }),
  position: createStandardFieldFlatMetadata({
    ...args,
    objectName,
    context: {
      fieldName: 'position',
      type: FieldMetadataType.POSITION,
      label: i18nLabel(
        msg({ message: `Position`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Target record position`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconHierarchy2',
      isSystem: true,
      isNullable: false,
      defaultValue: 0,
    },
  }),
  searchVector: createStandardFieldFlatMetadata({
    ...args,
    objectName,
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
  }),
  isAutomaticallyAssigned: createStandardFieldFlatMetadata({
    ...args,
    objectName,
    context: {
      fieldName: 'isAutomaticallyAssigned',
      type: FieldMetadataType.BOOLEAN,
      label: i18nLabel(
        msg({
          message: `Automatically assigned`,
          context: 'fieldMetadata.label',
        }),
      ),
      description: i18nLabel(
        msg({
          message: `Whether current participant rules justify this target`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconRobot',
      isSystem: true,
      isNullable: false,
      isUIEditable: false,
      defaultValue: false,
    },
  }),
  isManuallyAssigned: createStandardFieldFlatMetadata({
    ...args,
    objectName,
    context: {
      fieldName: 'isManuallyAssigned',
      type: FieldMetadataType.BOOLEAN,
      label: i18nLabel(
        msg({ message: `Manually assigned`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Whether a user explicitly assigned this target`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconUserCheck',
      isSystem: true,
      isNullable: false,
      isUIEditable: false,
      defaultValue: true,
    },
  }),
  targetPerson: createStandardRelationFieldFlatMetadata({
    ...args,
    objectName,
    context: {
      type: FieldMetadataType.MORPH_RELATION,
      morphId,
      fieldName: 'targetPerson',
      label: i18nLabel(
        msg({ message: `Person`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Target record`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconUser',
      isNullable: true,
      isUIEditable: false,
      isSystemSideEffect: true,
      targetObjectName: 'person',
      targetFieldName: inverseTargetFieldName,
      settings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: RelationOnDeleteAction.CASCADE,
        joinColumnName: 'targetPersonId',
      },
    },
  }),
  targetCompany: createStandardRelationFieldFlatMetadata({
    ...args,
    objectName,
    context: {
      type: FieldMetadataType.MORPH_RELATION,
      morphId,
      fieldName: 'targetCompany',
      label: i18nLabel(
        msg({ message: `Company`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Target record`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconBuildingSkyscraper',
      isNullable: true,
      isUIEditable: false,
      isSystemSideEffect: true,
      targetObjectName: 'company',
      targetFieldName: inverseTargetFieldName,
      settings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: RelationOnDeleteAction.CASCADE,
        joinColumnName: 'targetCompanyId',
      },
    },
  }),
  targetOpportunity: createStandardRelationFieldFlatMetadata({
    ...args,
    objectName,
    context: {
      type: FieldMetadataType.MORPH_RELATION,
      morphId,
      fieldName: 'targetOpportunity',
      label: i18nLabel(
        msg({ message: `Opportunity`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Target record`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconTargetArrow',
      isNullable: true,
      isUIEditable: false,
      isSystemSideEffect: true,
      targetObjectName: 'opportunity',
      targetFieldName: inverseTargetFieldName,
      settings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: RelationOnDeleteAction.CASCADE,
        joinColumnName: 'targetOpportunityId',
      },
    },
  }),
});
