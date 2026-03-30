'use client';

import type { TabType } from '@/sections/Tabs/types';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { useState } from 'react';
import { TabButtons } from '../TabButtons/TabButtons';
import { TabVisuals } from '../TabVisuals/TabVisuals';

const StyledTabGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  width: 100%;
  row-gap: ${theme.spacing(18)};
`;

type TabGroupProps = {
  tabs: TabType[];
};

export function TabGroup({ tabs }: TabGroupProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <StyledTabGroup>
      <TabButtons
        tabs={tabs}
        activeIndex={activeIndex}
        onSelect={setActiveIndex}
      />
      <TabVisuals tabs={tabs} activeIndex={activeIndex} />
    </StyledTabGroup>
  );
}
