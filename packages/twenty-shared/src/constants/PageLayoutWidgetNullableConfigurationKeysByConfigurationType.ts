import { type PageLayoutWidgetConfiguration } from '@/types';

type PageLayoutWidgetConfigurationType =
  PageLayoutWidgetConfiguration['configurationType'];

type NullableKeysOf<TConfiguration> = {
  [TKey in keyof TConfiguration]-?: null extends TConfiguration[TKey]
    ? TKey
    : never;
}[keyof TConfiguration];

type NullableKeysByConfigurationType = {
  [TConfigurationType in PageLayoutWidgetConfigurationType]: Record<
    NullableKeysOf<
      Extract<
        PageLayoutWidgetConfiguration,
        { configurationType: TConfigurationType }
      >
    >,
    true
  >;
};

export const PAGE_LAYOUT_WIDGET_NULLABLE_CONFIGURATION_KEYS_BY_CONFIGURATION_TYPE: Record<
  PageLayoutWidgetConfigurationType,
  Partial<Record<string, true>>
> = {
  AGGREGATE_CHART: {},
  PIE_CHART: {},
  BAR_CHART: {},
  LINE_CHART: {},
  VIEW: {},
  RECORD_TABLE: { viewId: true },
  FIELD: { nestedRelationFieldMetadataId: true },
  FIELDS: { viewId: true, newFieldDefaultVisibility: true },
  FORM_FIELD: {},
  FIELD_RICH_TEXT: {},
  STANDALONE_RICH_TEXT: {},
  IFRAME: {},
  FRONT_COMPONENT: {},
  TIMELINE: {},
  TASKS: {},
  NOTES: {},
  FILES: {},
  EMAILS: {},
  CALENDAR: {},
  WORKFLOW: {},
  WORKFLOW_VERSION: {},
  WORKFLOW_RUN: {},
  EMAIL_THREAD: {},
  MESSAGE_CAMPAIGN_BODY: {},
  MESSAGE_CAMPAIGN_DETAILS: {},
  CALL_RECORDING_SUMMARY: {},
  CALL_RECORDING_TRANSCRIPT: {},
  CHAT_THREADS: {},
  CHAT: {},
} satisfies NullableKeysByConfigurationType;
