import { MENU_DATA } from '@/app/(home)/constants/menu';
import {
  getCommunityStats,
  labelsFromCommunityStats,
} from '@/lib/community/fetch-community-stats';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import type { MenuDataType } from '@/sections/Menu/types';

export async function getMenuData(): Promise<MenuDataType> {
  const stats = await getCommunityStats();
  const labels = labelsFromCommunityStats(stats);

  return {
    navItems: MENU_DATA.navItems,
    socialLinks: mergeSocialLinkLabels(MENU_DATA.socialLinks, labels),
  };
}
