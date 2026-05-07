'use client';

import { useState } from 'react';

import { theme } from '@/theme';
import { styled } from '@linaria/react';

import type { TabType } from '@/sections/Tabs/types';

import { TabButtons } from './TabButtons';
import { TabVisuals } from './TabVisuals';

const StyledTabGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  row-gap: ${theme.spacing(18)};
  width: 100%;
`;

type TabGroupProps = {
  tabs: TabType[];
};

export function TabGroup({ tabs }: TabGroupProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <StyledTabGroup>
      <TabButtons
        activeIndex={activeIndex}
        onSelect={setActiveIndex}
        tabs={tabs}
      />
      <TabVisuals activeIndex={activeIndex} tabs={tabs} />
    </StyledTabGroup>
  );
}
