'use client';

import { Image } from '@/design-system/components';
import type { TabType } from '@/sections/Tabs/types';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

const VisualRoot = styled.div`
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    margin-left: auto;
    margin-right: auto;
    max-width: 995px;
  }
`;

const VisualImage = styled(Image)`
  border-radius: ${theme.radius(1)};
`;

type TabVisualsProps = {
  activeIndex: number;
  tabs: TabType[];
};

export function TabVisuals({ activeIndex, tabs }: TabVisualsProps) {
  const tab = tabs[activeIndex];

  if (!tab) {
    return null;
  }

  return (
    <VisualRoot role="tabpanel">
      <VisualImage alt={tab.image.alt} src={tab.image.src} />
    </VisualRoot>
  );
}
