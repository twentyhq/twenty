import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type ViewFieldOverrides } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { type MetadataUniversalEntityOverrides } from 'src/engine/metadata-modules/utils/metadata-universal-entity-overrides.type';

export const fromViewFieldOverridesToUniversalOverrides = ({
  overrides,
  viewFieldGroupUniversalIdentifierById,
  shouldThrowOnMissingIdentifier = true,
}: {
  overrides: ViewFieldOverrides;
  viewFieldGroupUniversalIdentifierById: Partial<Record<string, string>>;
  shouldThrowOnMissingIdentifier?: boolean;
}): MetadataUniversalEntityOverrides<'viewField'> => {
  const { viewFieldGroupId, ...scalarOverrides } = overrides;

  if (!isDefined(viewFieldGroupId)) {
    return {
      ...scalarOverrides,
      ...(viewFieldGroupId === null
        ? { viewFieldGroupUniversalIdentifier: null }
        : {}),
    };
  }

  const viewFieldGroupUniversalIdentifier =
    viewFieldGroupUniversalIdentifierById[viewFieldGroupId];

  if (!isDefined(viewFieldGroupUniversalIdentifier)) {
    if (shouldThrowOnMissingIdentifier) {
      throw new FlatEntityMapsException(
        `ViewFieldGroup universal identifier not found for id: ${viewFieldGroupId}`,
        FlatEntityMapsExceptionCode.RELATION_UNIVERSAL_IDENTIFIER_NOT_FOUND,
      );
    }

    return {
      ...scalarOverrides,
      viewFieldGroupUniversalIdentifier: null,
    };
  }

  return {
    ...scalarOverrides,
    viewFieldGroupUniversalIdentifier,
  };
};
