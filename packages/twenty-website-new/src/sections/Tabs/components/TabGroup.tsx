'use client';

import { useId, useState } from 'react';

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
  const idPrefix = useId();

  return (
    <StyledTabGroup>
      <TabButtons
        activeIndex={activeIndex}
        idPrefix={idPrefix}
        onSelect={setActiveIndex}
        tabs={tabs}
      />
      <TabVisuals
        activeIndex={activeIndex}
        panelId={`${idPrefix}-panel`}
        tabId={`${idPrefix}-tab-${activeIndex}`}
        tabs={tabs}
      />
    </StyledTabGroup>
  );
}
