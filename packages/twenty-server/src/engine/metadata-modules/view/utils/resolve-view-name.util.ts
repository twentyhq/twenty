import { isDefined } from 'twenty-shared/utils';

import { type ViewOverrides } from 'src/engine/metadata-modules/view/entities/view.entity';
import { type EffectiveEntityI18nContext } from 'src/engine/metadata-modules/utils/effective-entity-i18n-context.type';
import { OBJECT_LABEL_PLURAL_PLACEHOLDER } from 'src/engine/metadata-modules/view/constants/object-label-plural-placeholder.constant';
import { resolveEffectiveEntityProperty } from 'src/engine/metadata-modules/utils/resolve-effective-entity-property.util';

export const resolveViewName = ({
  view,
  objectLabelPlural,
  i18nContext,
}: {
  view: {
    name: string;
    overrides?: ViewOverrides | null;
  };
  objectLabelPlural: string | undefined;
  i18nContext: EffectiveEntityI18nContext;
}): string => {
  const resolvedName = resolveEffectiveEntityProperty({
    metadataName: 'view',
    baseValue: view.name,
    overrides: view.overrides,
    property: 'name',
    i18nContext,
  });

  if (!isDefined(objectLabelPlural)) {
    return resolvedName;
  }

  return resolvedName.replace(
    OBJECT_LABEL_PLURAL_PLACEHOLDER,
    objectLabelPlural,
  );
};
