'use client';

import { useLayoutEffect, useRef, useState } from 'react';

import { useLingui } from '@lingui/react';
import { INFORMATIVE_ICONS } from '@/icons';
import type { TabType } from '@/sections/Tabs/types';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

const TAB_INDICATOR_INSET_PX = 1;
const TAB_INDICATOR_TRANSITION_MS = 240;

const TabList = styled.div`
  display: grid;
  gap: ${theme.spacing(2)};
  grid-template-columns: minmax(0, max-content);
  justify-content: center;
  position: relative;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    grid-template-columns: repeat(2, minmax(0, max-content));
  }

  @media (min-width: ${theme.breakpoints.lg}px) {
    grid-template-columns: repeat(4, minmax(0, max-content));
  }
`;

const SelectionIndicator = styled.div`
  background-color: ${theme.colors.primary.background[100]};
  border-radius: ${theme.radius(2)};
  pointer-events: none;
  position: absolute;
  transition:
    height ${TAB_INDICATOR_TRANSITION_MS}ms ease-out,
    transform ${TAB_INDICATOR_TRANSITION_MS}ms ease-out,
    width ${TAB_INDICATOR_TRANSITION_MS}ms ease-out;
  z-index: 0;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const TabButtonLabel = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SlidingTabButton = styled.button`
  align-items: center;
  background: transparent;
  border: 1px solid ${theme.colors.secondary.border[10]};
  border-radius: ${theme.radius(2)};
  box-sizing: border-box;
  color: ${theme.colors.secondary.text[100]};
  cursor: pointer;
  display: grid;
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3.5)};
  font-weight: ${theme.font.weight.regular};
  gap: ${theme.spacing(2)};
  grid-template-columns: minmax(0, 1fr) auto;
  line-height: ${theme.lineHeight(3.5)};
  max-width: 100%;
  min-width: 0;
  padding: ${theme.spacing(2)};
  position: relative;
  text-align: left;
  transition:
    border-color ${TAB_INDICATOR_TRANSITION_MS}ms ease-out,
    color ${TAB_INDICATOR_TRANSITION_MS}ms ease-out;
  z-index: 1;

  &[data-active='true'] {
    border-color: transparent;
    color: ${theme.colors.primary.text[100]};
  }

  &:focus-visible {
    outline: 1px solid ${theme.colors.highlight[100]};
    outline-offset: 1px;
  }
`;

const TabIconBox = styled.span`
  background-color: ${theme.colors.highlight[100]};
  border-radius: ${theme.radius(1)};
  display: grid;
  height: ${theme.spacing(6)};
  overflow: hidden;
  place-items: center;
  transition: background-color ${TAB_INDICATOR_TRANSITION_MS}ms ease-out;
  width: ${theme.spacing(6)};

  & svg {
    display: block;
    max-height: 100%;
    max-width: 100%;
  }

  &[data-active='true'] {
    background-color: ${theme.colors.primary.text[10]};
  }
`;

type IndicatorPosition = {
  height: number;
  width: number;
  x: number;
  y: number;
};

const INITIAL_INDICATOR_POSITION: IndicatorPosition = {
  height: 0,
  width: 0,
  x: 0,
  y: 0,
};

type SlidingTabButtonsProps = {
  activeIndex: number;
  idPrefix: string;
  onSelect: (index: number) => void;
  tabs: TabType[];
};

export function SlidingTabButtons({
  activeIndex,
  idPrefix,
  onSelect,
  tabs,
}: SlidingTabButtonsProps) {
  const { i18n } = useLingui();
  const tabListRef = useRef<HTMLDivElement>(null);
  const tabButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [indicatorPosition, setIndicatorPosition] = useState(
    INITIAL_INDICATOR_POSITION,
  );

  useLayoutEffect(() => {
    const tabList = tabListRef.current;
    const activeTabButton = tabButtonRefs.current[activeIndex];

    if (!tabList || !activeTabButton) {
      return;
    }

    const updateIndicatorPosition = () => {
      const listRect = tabList.getBoundingClientRect();
      const tabRect = activeTabButton.getBoundingClientRect();

      setIndicatorPosition({
        height: tabRect.height - TAB_INDICATOR_INSET_PX * 2,
        width: tabRect.width - TAB_INDICATOR_INSET_PX * 2,
        x: tabRect.left - listRect.left + TAB_INDICATOR_INSET_PX,
        y: tabRect.top - listRect.top + TAB_INDICATOR_INSET_PX,
      });
    };

    updateIndicatorPosition();

    const resizeObserver = new ResizeObserver(updateIndicatorPosition);
    resizeObserver.observe(tabList);
    resizeObserver.observe(activeTabButton);

    return () => resizeObserver.disconnect();
  }, [activeIndex, tabs]);

  return (
    <TabList ref={tabListRef} role="tablist">
      <SelectionIndicator
        style={{
          height: indicatorPosition.height,
          transform: `translate3d(${indicatorPosition.x}px, ${indicatorPosition.y}px, 0)`,
          width: indicatorPosition.width,
        }}
      />
      {tabs.map((tab, index) => {
        const isActive = index === activeIndex;
        const Icon =
          INFORMATIVE_ICONS[tab.icon as keyof typeof INFORMATIVE_ICONS];
        const iconColor = isActive
          ? theme.colors.highlight[100]
          : theme.colors.secondary.text[100];

        return (
          <SlidingTabButton
            aria-controls={`${idPrefix}-panel`}
            aria-selected={isActive}
            data-active={String(isActive)}
            id={`${idPrefix}-tab-${index}`}
            key={index}
            onClick={() => onSelect(index)}
            ref={(element) => {
              tabButtonRefs.current[index] = element;
            }}
            role="tab"
            type="button"
          >
            <TabButtonLabel>{i18n._(tab.body)}</TabButtonLabel>
            <TabIconBox data-active={String(isActive)}>
              {Icon ? <Icon color={iconColor} size={16} /> : null}
            </TabIconBox>
          </SlidingTabButton>
        );
      })}
    </TabList>
  );
}
