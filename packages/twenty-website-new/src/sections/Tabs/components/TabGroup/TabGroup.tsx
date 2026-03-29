'use client';

import type { TabType } from '@/sections/Tabs/types';
import { useState } from 'react';
import { TabButtons } from '../TabButtons/TabButtons';
import { TabPanels } from '../TabPanels/TabPanels';

type TabGroupProps = {
  tabs: TabType[];
};

export function TabGroup({ tabs }: TabGroupProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <>
      <TabButtons
        tabs={tabs}
        activeIndex={activeIndex}
        onSelect={setActiveIndex}
      />
      <TabPanels tabs={tabs} activeIndex={activeIndex} />
    </>
  );
}
