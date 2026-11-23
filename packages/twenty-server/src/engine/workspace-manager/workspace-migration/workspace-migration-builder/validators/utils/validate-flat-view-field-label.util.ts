import { msg, t } from '@lingui/core/macro';
import { IDENTIFIER_MAX_CHAR_LENGTH } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { resolveEffectiveUniversalFlatEntityProperty } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-universal-flat-entity-property.util';
import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { type WorkspaceMigrationValidationBuildOptions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';

const getLabelError = (
  label: string,
): FlatEntityValidationError<ViewExceptionCode> | undefined => {
  if (label.trim() === '') {
    return {
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`A view field label cannot be empty, use null to show the default label`,
      userFriendlyMessage: msg`A column name cannot be empty`,
      value: label,
    };
  }

  if (label.length > IDENTIFIER_MAX_CHAR_LENGTH) {
    return {
      code: ViewExceptionCode.INVALID_VIEW_DATA,
      message: t`A view field label cannot be longer than ${IDENTIFIER_MAX_CHAR_LENGTH} characters`,
      userFriendlyMessage: msg`This column name is too long`,
      value: label,
    };
  }

  return undefined;
};

export const validateFlatViewFieldLabel = ({
  flatViewField,
  buildOptions,
}: {
  flatViewField: Pick<
    UniversalFlatViewField,
    'label' | 'applicationUniversalIdentifier' | 'universalOverrides'
  >;
  buildOptions: Pick<
    WorkspaceMigrationValidationBuildOptions,
    'workspaceCustomApplicationUniversalIdentifier'
  >;
}): FlatEntityValidationError<ViewExceptionCode>[] => {
  // A workspace rename of an application-owned column lands in its overrides
  const effectiveLabel = resolveEffectiveUniversalFlatEntityProperty({
    metadataName: 'viewField',
    universalFlatEntity: flatViewField,
    property: 'label',
    authorContext: {
      workspaceCustomApplicationUniversalIdentifier:
        buildOptions.workspaceCustomApplicationUniversalIdentifier,
    },
  });

  const labels = new Set(
    [flatViewField.label, effectiveLabel].filter(isDefined),
  );

  return [...labels].flatMap((label) => getLabelError(label) ?? []);
};
