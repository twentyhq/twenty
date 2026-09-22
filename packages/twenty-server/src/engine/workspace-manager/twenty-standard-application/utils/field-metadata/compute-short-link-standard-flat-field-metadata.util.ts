import { msg } from '@lingui/core/macro';
import { DateDisplayFormat, FieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import {
  type CreateStandardFieldArgs,
  createStandardFieldFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/create-standard-field-flat-metadata.util';
import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';

export const buildShortLinkStandardFlatFieldMetadatas = (
  args: Omit<
    CreateStandardFieldArgs<'shortLink', FieldMetadataType>,
    'context'
  >,
): Record<AllStandardObjectFieldName<'shortLink'>, FlatFieldMetadata> => {
  const createField = (
    context: CreateStandardFieldArgs<'shortLink', FieldMetadataType>['context'],
  ): FlatFieldMetadata => createStandardFieldFlatMetadata({ ...args, context });

  return {
    id: createField({
      fieldName: 'id',
      type: FieldMetadataType.UUID,
      label: i18nLabel(msg({ message: `ID`, context: 'fieldMetadata.label' })),
      description: i18nLabel(
        msg({ message: `ID`, context: 'fieldMetadata.description' }),
      ),
      icon: 'Icon123',
      isSystem: true,
      isNullable: false,
      isUIEditable: false,
      defaultValue: 'uuid',
    }),
    createdAt: createField({
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
    }),
    updatedAt: createField({
      fieldName: 'updatedAt',
      type: FieldMetadataType.DATE_TIME,
      label: i18nLabel(
        msg({ message: `Last update`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Last time the link was changed`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconCalendarClock',
      isSystem: true,
      isNullable: false,
      isUIEditable: false,
      defaultValue: 'now',
      settings: { displayFormat: DateDisplayFormat.RELATIVE },
    }),
    deletedAt: createField({
      fieldName: 'deletedAt',
      type: FieldMetadataType.DATE_TIME,
      label: i18nLabel(
        msg({ message: `Deleted at`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({ message: `Deleted at`, context: 'fieldMetadata.description' }),
      ),
      icon: 'IconCalendarMinus',
      isSystem: true,
      isNullable: true,
      isUIEditable: false,
      settings: { displayFormat: DateDisplayFormat.RELATIVE },
    }),
    createdBy: createField({
      fieldName: 'createdBy',
      type: FieldMetadataType.ACTOR,
      label: i18nLabel(
        msg({ message: `Created by`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `The creator of the link`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconCreativeCommonsSa',
      isSystem: true,
      isNullable: false,
      isUIEditable: false,
      defaultValue: {
        source: "'MANUAL'",
        name: "'System'",
        workspaceMemberId: null,
      },
    }),
    updatedBy: createField({
      fieldName: 'updatedBy',
      type: FieldMetadataType.ACTOR,
      label: i18nLabel(
        msg({ message: `Updated by`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `The last editor of the link`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconUserCircle',
      isSystem: true,
      isNullable: false,
      isUIEditable: false,
      defaultValue: {
        source: "'MANUAL'",
        name: "'System'",
        workspaceMemberId: null,
      },
    }),
    position: createField({
      fieldName: 'position',
      type: FieldMetadataType.POSITION,
      label: i18nLabel(
        msg({ message: `Position`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({ message: `Link position`, context: 'fieldMetadata.description' }),
      ),
      icon: 'IconHierarchy2',
      isSystem: true,
      isNullable: false,
      defaultValue: 0,
    }),
    searchVector: createField({
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
    }),
    templateUrl: createField({
      fieldName: 'templateUrl',
      type: FieldMetadataType.TEXT,
      label: i18nLabel(
        msg({ message: `Template URL`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `URL as authored in the campaign, including variables`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconLink',
      isSystem: true,
      isNullable: false,
      isUIEditable: false,
    }),
    resolvedUrl: createField({
      fieldName: 'resolvedUrl',
      type: FieldMetadataType.TEXT,
      label: i18nLabel(
        msg({ message: `Resolved URL`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Destination URL after recipient variables are replaced`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconLink',
      isSystem: true,
      isNullable: false,
      isUIEditable: false,
    }),
    identityHash: createField({
      fieldName: 'identityHash',
      type: FieldMetadataType.TEXT,
      label: i18nLabel(
        msg({ message: `Link identity hash`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Hash of the template and resolved URLs`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'Icon123',
      isSystem: true,
      isNullable: false,
      isUIEditable: false,
    }),
  };
};
