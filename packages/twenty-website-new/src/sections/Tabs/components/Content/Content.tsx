'use client';

import { Image } from '@/design-system/components';
import {
  HistoryIcon,
  SearchIcon,
  TaskIcon,
  WorkflowIcon,
} from '@/icons';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { useState } from 'react';

const TAB_ITEMS = [
  { label: 'Show me all deals closing this month', icon: SearchIcon },
  {
    label: 'Create follow-up tasks for my top 10 accounts',
    icon: TaskIcon,
  },
  { label: "Summarize this customer's history", icon: HistoryIcon },
  {
    label: 'Create a workflow that send an email sequence',
    icon: WorkflowIcon,
  },
] as const;

const PANEL_IMAGES = [
  { src: '/images/product/tabs/deals.png', alt: 'Deals view' },
  { src: '/images/product/tabs/tasks.png', alt: 'Tasks view' },
  { src: '/images/product/tabs/history.png', alt: 'History view' },
  { src: '/images/product/tabs/workflow.png', alt: 'Workflow view' },
] as const;

const TabList = styled.div`
  display: grid;
  gap: ${theme.spacing(2)};
  grid-template-columns: 1fr;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    grid-template-columns: repeat(2, max-content);
    justify-content: center;
  }

  @media (min-width: ${theme.breakpoints.lg}px) {
    grid-template-columns: repeat(4, max-content);
  }
`;

const TabButton = styled.button`
  border: 1px solid transparent;
  border-radius: ${theme.radius(1)};
  cursor: pointer;
  display: grid;
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3.5)};
  font-weight: ${theme.font.weight.regular};
  gap: ${theme.spacing(2)};
  grid-template-columns: auto auto;
  justify-content: space-between;
  line-height: ${theme.lineHeight(3.5)};
  padding: ${theme.spacing(2)};
  text-align: left;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;

  &[data-active='true'] {
    background-color: ${theme.colors.primary.background[100]};
    border-color: transparent;
    color: ${theme.colors.primary.text[100]};
  }

  &[data-active='false'] {
    background-color: transparent;
    border-color: ${theme.colors.secondary.border[10]};
    color: ${theme.colors.secondary.text[100]};
  }

  &:focus-visible {
    outline: 1px solid ${theme.colors.highlight[100]};
    outline-offset: 1px;
  }
`;

const TabIconBox = styled.span`
  border-radius: ${theme.radius(0.5)};
  display: grid;
  height: ${theme.spacing(6)};
  justify-items: center;
  width: ${theme.spacing(6)};

  &[data-active='true'] {
    background-color: ${theme.colors.primary.text[10]};
  }

  &[data-active='false'] {
    background-color: ${theme.colors.highlight[100]};
  }
`;

const Panel = styled.div`
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    margin-left: auto;
    margin-right: auto;
    max-width: 995px;
  }
`;

const PanelImage = styled(Image)`
  border-radius: ${theme.radius(1)};
`;

export function Content() {
  const [activeIndex, setActiveIndex] = useState(0);
  const panel = PANEL_IMAGES[activeIndex];

  return (
    <>
      <TabList role="tablist">
        {TAB_ITEMS.map((tab, index) => {
          const isActive = index === activeIndex;
          const Icon = tab.icon;

          return (
            <TabButton
              key={tab.label}
              type="button"
              role="tab"
              aria-selected={isActive}
              data-active={String(isActive)}
              onClick={() => setActiveIndex(index)}
            >
              {tab.label}
              <TabIconBox data-active={String(isActive)}>
                <Icon
                  size={16}
                  color={
                    isActive
                      ? theme.colors.primary.text[100]
                      : theme.colors.secondary.text[100]
                  }
                />
              </TabIconBox>
            </TabButton>
          );
        })}
      </TabList>
      {panel ? (
        <Panel role="tabpanel">
          <PanelImage src={panel.src} alt={panel.alt} />
        </Panel>
      ) : null}
    </>
  );
}
