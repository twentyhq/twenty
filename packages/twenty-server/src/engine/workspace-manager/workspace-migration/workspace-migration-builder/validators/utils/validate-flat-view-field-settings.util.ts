import { msg, t } from '@lingui/core/macro';
import { RelationType, type ViewFieldSettings } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { isRelationUniversalFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-relation-universal-flat-field-metadata-of-type.util';
import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { viewFieldSettingsSchema } from 'src/engine/metadata-modules/view-field/schemas/view-field-settings.schema';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

export const validateFlatViewFieldSettings = ({
  settings,
  isCanonical,
  flatFieldMetadata,
}: {
  settings: ViewFieldSettings | null;
  isCanonical: boolean;
  flatFieldMetadata: Pick<
    UniversalFlatFieldMetadata,
    'type' | 'universalSettings'
  >;
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

  const parsedSettings = viewFieldSettingsSchema.strict().safeParse(settings);

  if (!parsedSettings.success) {
    const issues = z.prettifyError(parsedSettings.error);

    return [
      {
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`Invalid view field settings: ${issues}`,
        userFriendlyMessage: msg`Invalid column settings`,
      },
    ];
  }

  if (
    isDefined(parsedSettings.data.recordLimit) &&
    !isRelationUniversalFlatFieldMetadataOfType({
      flatFieldMetadata,
      relationType: RelationType.ONE_TO_MANY,
    })
  ) {
    return [
      {
        code: ViewExceptionCode.INVALID_VIEW_DATA,
        message: t`View field record limit is only supported on one-to-many relation fields`,
        userFriendlyMessage: msg`A record limit can only be set on a column listing related records`,
      },
    ];
  }

  return [];
};
