'use client';

import type { TabType } from '@/sections/Tabs/types';
import { TabVisual } from '../TabVisual/TabVisual';

type TabVisualsProps = {
  tabs: TabType[];
  activeIndex: number;
};

export function TabVisuals({ tabs, activeIndex }: TabVisualsProps) {
  const tab = tabs[activeIndex];

  if (!tab) {
    return null;
  }

  return <TabVisual image={tab.image} />;
}
