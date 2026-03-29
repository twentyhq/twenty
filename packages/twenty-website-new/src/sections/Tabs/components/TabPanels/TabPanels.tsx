'use client';

import type { TabType } from '@/sections/Tabs/types';
import { TabPanel } from '../TabPanel/TabPanel';

type TabPanelsProps = {
  tabs: TabType[];
  activeIndex: number;
};

export function TabPanels({ tabs, activeIndex }: TabPanelsProps) {
  const tab = tabs[activeIndex];

  if (!tab) {
    return null;
  }

  return <TabPanel image={tab.image} />;
}
