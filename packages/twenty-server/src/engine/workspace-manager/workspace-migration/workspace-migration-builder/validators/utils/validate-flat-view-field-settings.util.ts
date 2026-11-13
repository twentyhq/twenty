import { msg, t } from '@lingui/core/macro';
import { IDENTIFIER_MAX_CHAR_LENGTH } from 'twenty-shared/metadata';
import { QUERY_MAX_RECORDS_FROM_RELATION } from 'twenty-shared/constants';
import { RelationType, type ViewFieldSettings } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { isMorphOrRelationFieldMetadataType } from 'src/engine/utils/is-morph-or-relation-field-metadata-type.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

type ViewFieldSettingsFlatFieldMetadata = Pick<
  UniversalFlatFieldMetadata,
  'type' | 'universalSettings'
>;

const VIEW_FIELD_SETTINGS_KEYS: (keyof ViewFieldSettings)[] = [
  'label',
  'recordLimit',
];

const isOneToManyRelationField = ({
  type,
  universalSettings,
}: ViewFieldSettingsFlatFieldMetadata): boolean =>
  isMorphOrRelationFieldMetadataType(type) &&
  isDefined(universalSettings) &&
  'relationType' in universalSettings &&
  universalSettings.relationType === RelationType.ONE_TO_MANY;

export const validateFlatViewFieldSettings = ({
  settings,
  flatFieldMetadata,
}: {
  settings: ViewFieldSettings | null;
  flatFieldMetadata: ViewFieldSettingsFlatFieldMetadata;
}): FlatEntityValidationError<ViewExceptionCode>[] => {
  if (!isDefined(settings)) {
    return [];
  }

  const errors: FlatEntityValidationError<ViewExceptionCode>[] = [];

  const unknownKeys = Object.keys(settings).filter(
    (key) => !VIEW_FIELD_SETTINGS_KEYS.includes(key as keyof ViewFieldSettings),
  );

  if (unknownKeys.length > 0) {
    errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`Unknown view field settings: ${unknownKeys.join(', ')}`,
      userFriendlyMessage: msg`Invalid column settings`,
    });
  }

  const { label, recordLimit } = settings;

  if (
    isDefined(label) &&
    (typeof label !== 'string' ||
      label.trim().length === 0 ||
      label.length > IDENTIFIER_MAX_CHAR_LENGTH)
  ) {
    errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`View field label must be a non-empty string of at most ${IDENTIFIER_MAX_CHAR_LENGTH} characters`,
      userFriendlyMessage: msg`Column name must be between 1 and ${IDENTIFIER_MAX_CHAR_LENGTH} characters`,
    });
  }

  if (!isDefined(recordLimit)) {
    return errors;
  }

  if (!isOneToManyRelationField(flatFieldMetadata)) {
    errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`View field record limit is only supported on one-to-many relation fields`,
      userFriendlyMessage: msg`A record limit can only be set on a column listing related records`,
    });
  }

  if (
    !Number.isInteger(recordLimit) ||
    recordLimit < 1 ||
    recordLimit > QUERY_MAX_RECORDS_FROM_RELATION
  ) {
    errors.push({
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`View field record limit must be an integer between 1 and ${QUERY_MAX_RECORDS_FROM_RELATION}`,
      userFriendlyMessage: msg`Record limit must be between 1 and ${QUERY_MAX_RECORDS_FROM_RELATION}`,
    });
  }

  return errors;
};
