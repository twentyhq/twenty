import type {
  HeroSidebarEntry,
  HeroSidebarFolder,
} from '@/sections/Hero/types';

export function isFolder(entry: HeroSidebarEntry): entry is HeroSidebarFolder {
  return 'items' in entry;
}
