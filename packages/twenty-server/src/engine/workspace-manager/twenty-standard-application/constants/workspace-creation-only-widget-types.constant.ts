import { WidgetType } from 'twenty-shared/types';

// Upgrade commands build from the standard definitions, sometimes at steps that
// run before a later upgrade adds these types to the widget type enum, so only
// workspace creation, on a fully upgraded database, creates their widgets.
export const WORKSPACE_CREATION_ONLY_WIDGET_TYPES: WidgetType[] = [
  WidgetType.CHAT_THREADS,
];
