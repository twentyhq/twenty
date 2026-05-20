'use client';

import type { TabType } from '@/sections/Tabs/types';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

import { TabButton } from './TabButton';

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
  activeIndex: number;
  idPrefix: string;
  onSelect: (index: number) => void;
  tabs: TabType[];
};

export function TabButtons({
  activeIndex,
  idPrefix,
  onSelect,
  tabs,
}: TabButtonsProps) {
  return (
    <TabButtonsGrid role="tablist">
      {tabs.map((tab, index) => (
        <TabButton
          controls={`${idPrefix}-panel`}
          id={`${idPrefix}-tab-${index}`}
          isActive={index === activeIndex}
          key={index}
          onSelect={() => onSelect(index)}
          tab={tab}
        />
      ))}
    </TabButtonsGrid>
  );
}
