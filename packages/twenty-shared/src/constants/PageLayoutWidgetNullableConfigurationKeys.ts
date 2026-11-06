import { type PageLayoutWidgetConfiguration } from '@/types';

type NullableKeysOf<TConfiguration> = TConfiguration extends unknown
  ? {
      [TKey in keyof TConfiguration]-?: null extends TConfiguration[TKey]
        ? TKey
        : never;
    }[keyof TConfiguration]
  : never;

export const PAGE_LAYOUT_WIDGET_NULLABLE_CONFIGURATION_KEYS: Record<
  string,
  true
> = {
  viewId: true,
  newFieldDefaultVisibility: true,
  nestedRelationFieldMetadataId: true,
} satisfies Record<NullableKeysOf<PageLayoutWidgetConfiguration>, true>;
