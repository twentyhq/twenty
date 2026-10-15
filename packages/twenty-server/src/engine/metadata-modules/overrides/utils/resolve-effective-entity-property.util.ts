import { isNonEmptyString, isString } from '@sniptt/guards';
import {
  buildTranslatablePropertyPath,
  FIELD_OPTION_LABEL_TRANSLATABLE_PROPERTY_PATTERN,
  findNestedTranslatablePropertyContext,
  mapManifestTranslatableValues,
  MANIFEST_TRANSLATABLE_PROPERTIES,
  type ManifestTranslatableEntity,
  type ManifestTranslatableProperty,
  type TranslatableMetadataName,
} from 'twenty-shared/i18n';
import { type AllMetadataName } from 'twenty-shared/metadata';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { type FieldMetadataDefaultOption } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { translateStandardLabel } from 'src/engine/core-modules/i18n/utils/translate-standard-label.util';
import {
  type MetadataEntityOverridablePropertyName,
  type MetadataEntityTranslatablePropertyName,
} from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';
import { ALL_TRANSLATABLE_PROPERTIES_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-translatable-properties-by-metadata-name.constant';
import { type AuthoredOverrides } from 'src/engine/metadata-modules/overrides/types/authored-overrides.type';
import { type EffectiveEntityI18nContext } from 'src/engine/metadata-modules/overrides/types/effective-entity-i18n-context.type';
import { type MetadataPresentationOverrides } from 'src/engine/metadata-modules/overrides/types/metadata-presentation-overrides.type';
import { type OverrideAuthorReadContext } from 'src/engine/metadata-modules/overrides/types/override-author-context.type';
import { readAuthoredOverrideProperty } from 'src/engine/metadata-modules/overrides/utils/read-authored-override-property.util';

export const readOverrideTranslation = ({
  metadataName,
  overrides,
  locale,
  property,
  authorContext,
}: {
  metadataName: AllMetadataName;
  overrides: unknown;
  locale: string;
  property: string;
  authorContext: OverrideAuthorReadContext;
}): string | undefined => {
  const translation = readAuthoredOverrideProperty({
    metadataName,
    overrides,
    path: ['translations', locale, property],
    authorContext,
  });

  return typeof translation === 'string' ? translation : undefined;
};

const resolveEffectiveProperty = ({
  metadataName,
  baseValue,
  overrides,
  property,
  i18nContext,
}: {
  metadataName: AllMetadataName;
  baseValue: string | null | undefined;
  overrides: unknown;
  property: string;
  i18nContext: EffectiveEntityI18nContext;
}): string => {
  const translatableProperties: readonly string[] =
    ALL_TRANSLATABLE_PROPERTIES_BY_METADATA_NAME[metadataName] ?? [];

  const nestedPropertyContext = findNestedTranslatablePropertyContext({
    metadataName,
    property,
  });
  const isTranslatable =
    isDefined(nestedPropertyContext) ||
    translatableProperties.includes(property);

  const overrideValue = readAuthoredOverrideProperty({
    metadataName,
    overrides,
    path: [property],
    authorContext: i18nContext,
  });

  const { locale, i18nInstance, isStandardApp, applicationCatalog } =
    i18nContext;
  const safeLocale = locale ?? SOURCE_LOCALE;
  const safeBaseValue = baseValue ?? '';

  // Workspace-authored translations apply to every entity, custom ones
  // included: a custom object created in French can still carry an English
  // translation even though it has no catalog to fall back to.
  if (isTranslatable) {
    const translation = readOverrideTranslation({
      metadataName,
      overrides,
      locale: safeLocale,
      property,
      authorContext: i18nContext,
    });

    if (isDefined(translation)) {
      return translation;
    }
  }

  // Custom (non-standard) entities without a catalog have no standard label
  // to resolve or translate, and property renames live in base columns.
  if (!isStandardApp && !isDefined(applicationCatalog)) {
    return safeBaseValue;
  }

  if (!isTranslatable && isDefined(overrideValue)) {
    return overrideValue as string;
  }

  if (isNonEmptyString(overrideValue)) {
    return overrideValue;
  }

  return translateStandardLabel({
    sourceValue: safeBaseValue,
    context: nestedPropertyContext ?? `${metadataName}.${property}`,
    isStandardApp,
    applicationCatalog,
    i18nInstance,
  });
};

export const resolveEffectiveEntityProperty = <T extends AllMetadataName>({
  metadataName,
  baseValue,
  overrides,
  property,
  i18nContext,
}: {
  metadataName: T;
  baseValue: string | null | undefined;
  overrides:
    | AuthoredOverrides<MetadataPresentationOverrides<T>>
    | null
    | undefined;
  // A property is resolvable if it is overridable, translatable, or both:
  // navigationMenuItem.name is translated but never renamed, so keying this on
  // "overridable" alone would lock it out of the shared resolution path.
  property: (
    | MetadataEntityOverridablePropertyName<T>
    | MetadataEntityTranslatablePropertyName<T>
  ) &
    string;
  i18nContext: EffectiveEntityI18nContext;
}): string =>
  resolveEffectiveProperty({
    metadataName,
    baseValue,
    overrides,
    property,
    i18nContext,
  });

// Subscription events carry their metadata name as data, so a caller cannot
// satisfy the generic above: TypeScript collapses the property union across
// every possible name. The registry is what guarantees the pairing.
export const resolveEffectiveEntityPropertyByName = ({
  metadataName,
  baseValue,
  overrides,
  property,
  i18nContext,
}: {
  metadataName: TranslatableMetadataName;
  baseValue: unknown;
  overrides: unknown;
  property: string;
  i18nContext: EffectiveEntityI18nContext;
}): string =>
  resolveEffectiveProperty({
    metadataName,
    baseValue: typeof baseValue === 'string' ? baseValue : undefined,
    overrides,
    property,
    i18nContext,
  });

export const resolveEffectiveFieldMetadataOptionLabel = ({
  option,
  overrides,
  i18nContext,
}: {
  option: Pick<FieldMetadataDefaultOption, 'id' | 'label'>;
  overrides: unknown;
  i18nContext: EffectiveEntityI18nContext;
}): string =>
  isDefined(option.id)
    ? resolveEffectiveProperty({
        metadataName: 'fieldMetadata',
        baseValue: option.label,
        overrides,
        property: buildTranslatablePropertyPath({
          pattern: FIELD_OPTION_LABEL_TRANSLATABLE_PROPERTY_PATTERN,
          itemIds: [option.id],
        }),
        i18nContext,
      })
    : translateStandardLabel({
        sourceValue: option.label,
        context:
          MANIFEST_TRANSLATABLE_PROPERTIES.fieldMetadata[
            FIELD_OPTION_LABEL_TRANSLATABLE_PROPERTY_PATTERN
          ],
        isStandardApp: i18nContext.isStandardApp,
        applicationCatalog: i18nContext.applicationCatalog,
        i18nInstance: i18nContext.i18nInstance,
      });

type ManifestMessageI18nContext = Pick<
  EffectiveEntityI18nContext,
  'isStandardApp' | 'applicationCatalog' | 'i18nInstance'
>;

export const resolveEffectiveManifestMessage = <
  TEntity extends ManifestTranslatableEntity,
>({
  entity,
  property,
  sourceValue,
  i18nContext,
}: {
  entity: TEntity;
  property: ManifestTranslatableProperty<TEntity>;
  sourceValue: string;
  i18nContext: ManifestMessageI18nContext;
}): string => {
  const contextByProperty: Record<string, string> =
    MANIFEST_TRANSLATABLE_PROPERTIES[entity];

  return translateStandardLabel({
    sourceValue,
    context: contextByProperty[property],
    isStandardApp: i18nContext.isStandardApp,
    applicationCatalog: i18nContext.applicationCatalog,
    i18nInstance: i18nContext.i18nInstance,
  });
};

export const resolveEffectiveManifestMessages = <TValue>({
  entity,
  value,
  i18nContext,
}: {
  entity: ManifestTranslatableEntity;
  value: TValue;
  i18nContext: ManifestMessageI18nContext;
}): TValue =>
  mapManifestTranslatableValues({
    entity,
    value,
    mapValue: ({ value: sourceValue, context }) =>
      isString(sourceValue)
        ? translateStandardLabel({
            sourceValue,
            context,
            isStandardApp: i18nContext.isStandardApp,
            applicationCatalog: i18nContext.applicationCatalog,
            i18nInstance: i18nContext.i18nInstance,
          })
        : sourceValue,
  });
