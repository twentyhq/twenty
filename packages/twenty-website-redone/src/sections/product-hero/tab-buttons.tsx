'use client';

import { styled } from '@linaria/react';
import { type CSSProperties, type Ref } from 'react';

import { mediaUp, spacing } from '@/tokens';

import { type AiHeroTab } from './ai-hero-tabs';
import { TabButton } from './tab-button';

const TabButtonsGrid = styled.div`
  display: grid;
  gap: ${spacing(2)};
  grid-template-columns: minmax(0, max-content);
  justify-content: center;
  width: 100%;

  ${mediaUp('md')} {
    grid-template-columns: repeat(2, minmax(0, max-content));
  }

  ${mediaUp('lg')} {
    grid-template-columns: repeat(4, minmax(0, max-content));
  }
`;

export function TabButtons({
  activeIndex,
  className,
  containerRef,
  idPrefix,
  onSelect,
  style,
  tabs,
}: {
  activeIndex: number;
  className?: string;
  containerRef?: Ref<HTMLDivElement>;
  idPrefix: string;
  onSelect: (index: number) => void;
  style?: CSSProperties;
  tabs: AiHeroTab[];
}) {
  // Tabs are an authored fixed set: position is identity.
  const numberedTabs = tabs.map((tab, tabNumber) => ({ tab, tabNumber }));

  return (
    <TabButtonsGrid
      className={className}
      ref={containerRef}
      role="tablist"
      style={style}
    >
      {numberedTabs.map(({ tab, tabNumber }) => (
        <TabButton
          controls={`${idPrefix}-panel`}
          id={`${idPrefix}-tab-${tabNumber}`}
          isActive={tabNumber === activeIndex}
          key={tabNumber}
          onSelect={() => onSelect(tabNumber)}
          tab={tab}
        />
      ))}
    </TabButtonsGrid>
  );
}
