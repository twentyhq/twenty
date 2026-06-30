import { type SidebarEntry, type SidebarFolderDef } from '../types';

export function isSidebarFolder(
  entry: SidebarEntry,
): entry is SidebarFolderDef {
  return Array.isArray((entry as SidebarFolderDef).items);
}
