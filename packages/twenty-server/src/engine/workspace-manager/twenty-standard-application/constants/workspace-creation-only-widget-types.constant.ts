import { WidgetType } from 'twenty-shared/types';

// Upgrade commands build from the standard definitions, sometimes at steps that
// run before a later upgrade adds these types to the widget type enum, so only
// workspace creation, on a fully upgraded database, creates their widgets. A
// type leaves this list once every version before the one adding it to the enum
// has left TWENTY_CROSS_UPGRADE_SUPPORTED_VERSIONS.
export const WORKSPACE_CREATION_ONLY_WIDGET_TYPES: WidgetType[] = [
  // Added to the enum in 2.44
  WidgetType.CHAT_THREADS,
];
