import {
  interpolateMessagePlaceholders,
  type MetadataLabelPlaceholderValues,
} from 'twenty-shared/i18n';

import { type ViewOverrides } from 'src/engine/metadata-modules/view/entities/view.entity';
import { type EffectiveEntityI18nContext } from 'src/engine/metadata-modules/utils/effective-entity-i18n-context.type';
import { resolveEffectiveEntityProperty } from 'src/engine/metadata-modules/utils/resolve-effective-entity-property.util';

export const resolveViewName = ({
  view,
  objectLabelPlaceholderValues,
  i18nContext,
}: {
  view: {
    name: string;
    overrides?: ViewOverrides | null;
  };
  objectLabelPlaceholderValues?: MetadataLabelPlaceholderValues;
  i18nContext: EffectiveEntityI18nContext;
}): string => {
  const resolvedName = resolveEffectiveEntityProperty({
    metadataName: 'view',
    baseValue: view.name,
    overrides: view.overrides,
    property: 'name',
    i18nContext,
  });

  return interpolateMessagePlaceholders(
    resolvedName,
    objectLabelPlaceholderValues,
  );
};
