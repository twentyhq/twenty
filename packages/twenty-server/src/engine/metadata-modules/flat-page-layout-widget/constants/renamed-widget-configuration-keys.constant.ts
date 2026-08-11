import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

// Configuration keys that app manifests may still carry under their former
// name, mapped to their current name. Resolving them would let a stale
// manifest install a widget bound to nothing, so sync rejects them instead.
export const RENAMED_WIDGET_CONFIGURATION_KEYS: Partial<
  Record<WidgetConfigurationType, Record<string, string>>
> = {
  [WidgetConfigurationType.FIELDS]: { viewId: 'viewUniversalIdentifier' },
  [WidgetConfigurationType.RECORD_TABLE]: { viewId: 'viewUniversalIdentifier' },
};
