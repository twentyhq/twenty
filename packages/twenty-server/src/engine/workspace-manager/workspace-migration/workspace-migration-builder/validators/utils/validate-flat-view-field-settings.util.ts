import { msg, t } from '@lingui/core/macro';
import { IDENTIFIER_MAX_CHAR_LENGTH } from 'twenty-shared/metadata';
import { QUERY_MAX_RECORDS_FROM_RELATION } from 'twenty-shared/constants';
import { type ViewFieldSettings } from 'twenty-shared/types';
import { isDefined, isPlainObject } from 'twenty-shared/utils';
import { isNonEmptyString, isString } from '@sniptt/guards';

import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { isOneToManyRelationUniversalFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-one-to-many-relation-universal-flat-field-metadata.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

type ViewFieldSettingsFlatFieldMetadata = Pick<
  UniversalFlatFieldMetadata,
  'type' | 'universalSettings'
>;

const VIEW_FIELD_SETTINGS_KEYS = new Set<string>([
  'label',
  'recordLimit',
] satisfies (keyof ViewFieldSettings)[]);

export const validateFlatViewFieldSettings = ({
  settings,
  isCanonical,
  flatFieldMetadata,
}: {
  settings: ViewFieldSettings | null;
  isCanonical: boolean;
  flatFieldMetadata: ViewFieldSettingsFlatFieldMetadata;
}): FlatEntityValidationError<ViewExceptionCode>[] => {
  if (!isDefined(settings)) {
    return [];
  }

  if (isCanonical) {
    return [
      {
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`Only non-canonical view fields can have settings`,
        userFriendlyMessage: msg`Only added columns can be customized`,
      },
    ];
  }

  if (!isPlainObject(settings)) {
    return [
      {
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View field settings must be an object`,
        userFriendlyMessage: msg`Invalid column settings`,
      },
    ];
  }

  const errors: FlatEntityValidationError<ViewExceptionCode>[] = [];

  const unknownKeys = Object.keys(settings).filter(
    (key) => !VIEW_FIELD_SETTINGS_KEYS.has(key),
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
    (!isString(label) ||
      !isNonEmptyString(label.trim()) ||
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

  if (!isOneToManyRelationUniversalFlatFieldMetadata(flatFieldMetadata)) {
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
