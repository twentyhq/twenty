import type { SidebarEntry, SidebarFolderDef } from '../types';

export function isFolder(entry: SidebarEntry): entry is SidebarFolderDef {
  return 'items' in entry;
}
