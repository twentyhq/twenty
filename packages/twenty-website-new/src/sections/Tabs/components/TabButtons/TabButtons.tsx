'use client';

import type { TabType } from '@/sections/Tabs/types';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { TabButton } from '../TabButton/TabButton';

const TabButtonsGrid = styled.div`
  display: grid;
  gap: ${theme.spacing(2)};
  grid-template-columns: minmax(0, max-content);
  justify-content: center;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    grid-template-columns: repeat(2, minmax(0, max-content));
  }

  @media (min-width: ${theme.breakpoints.lg}px) {
    grid-template-columns: repeat(4, minmax(0, max-content));
  }
`;

type TabButtonsProps = {
  tabs: TabType[];
  activeIndex: number;
  onSelect: (index: number) => void;
};

export function TabButtons({ tabs, activeIndex, onSelect }: TabButtonsProps) {
  return (
    <TabButtonsGrid role="tablist">
      {tabs.map((tab, index) => (
        <TabButton
          key={index}
          tab={tab}
          isActive={index === activeIndex}
          onSelect={() => onSelect(index)}
        />
      ))}
    </TabButtonsGrid>
  );
}
