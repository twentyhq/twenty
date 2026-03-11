import { type FormatRecordSerializedRelationProperties } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type ViewFieldOverrides } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';

type UniversalViewFieldOverrides =
  FormatRecordSerializedRelationProperties<ViewFieldOverrides>;

export const fromViewFieldOverridesToUniversalOverrides = ({
  overrides,
  viewFieldGroupUniversalIdentifierById,
}: {
  overrides: ViewFieldOverrides;
  viewFieldGroupUniversalIdentifierById: Partial<Record<string, string>>;
}): UniversalViewFieldOverrides => {
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
    viewFieldGroupUniversalIdentifierById[viewFieldGroupId] ?? null;

  return {
    ...scalarOverrides,
    viewFieldGroupUniversalIdentifier,
  };
};
