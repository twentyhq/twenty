import {
  COMMAND_MENU_CORE_OBJECT_NAMES,
  type CommandMenuCoreObjectName,
} from '../../types';

export const isCommandMenuCoreObjectName = (
  value: unknown,
): value is CommandMenuCoreObjectName =>
  COMMAND_MENU_CORE_OBJECT_NAMES.includes(value as CommandMenuCoreObjectName);
