import { WidgetType } from 'twenty-shared/types';

// Upgrade steps can run before the widget type enum holds these; drop one once every version before it
// has left TWENTY_CROSS_UPGRADE_SUPPORTED_VERSIONS
export const WORKSPACE_CREATION_ONLY_WIDGET_TYPES: WidgetType[] = [
  // Both added to the enum in 2.44
  WidgetType.CHAT_THREADS,
  WidgetType.CHAT,
  // Added to the enum in 2.46
  WidgetType.CALENDAR_EVENT_PARTICIPANTS,
];
