export const COMMAND_MENU_CORE_OBJECT_NAMES = ['workflow'] as const;

export type CommandMenuCoreObjectName =
  (typeof COMMAND_MENU_CORE_OBJECT_NAMES)[number];
