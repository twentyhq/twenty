'use client';

import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import {
  IconChartBar,
  IconChecklist,
  IconHierarchy3,
  IconLayoutKanban,
} from '@tabler/icons-react';

import {
  color,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  radius,
  spacing,
} from '@/tokens';

import { type AiHeroTab, type AiHeroTabIcon } from './ai-hero-tabs';

const TAB_ICONS: Record<AiHeroTabIcon, typeof IconChartBar> = {
  chart: IconChartBar,
  checklist: IconChecklist,
  kanban: IconLayoutKanban,
  workflow: IconHierarchy3,
};

const Label = styled.span`
  display: block;
  min-width: 0;
  padding-bottom: 1px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

// Authored for the dark AI layer: inactive tabs are washed near-black
// cards; the active tab inverts to white.
const StyledButton = styled.button`
  align-items: center;
  border-radius: ${radius(2)};
  box-sizing: border-box;
  cursor: pointer;
  display: grid;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  font-weight: ${FONT_WEIGHT.regular};
  gap: ${spacing(2)};
  grid-template-columns: minmax(0, 1fr) auto;
  line-height: ${fontSize(3.5)};
  max-width: 100%;
  min-width: 0;
  padding: calc(${spacing(2)} + 1px) ${spacing(2)};
  text-align: left;
  transition:
    background-color 0.2s ease,
    background-image 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;

  &[data-active='true'] {
    background-color: ${color('white')};
    border: 1px solid transparent;
    color: ${color('black')};
  }

  &[data-active='false'] {
    background-color: ${color('black')};
    background-image: linear-gradient(
      90deg,
      ${color('white-10')} 0%,
      ${color('white-10')} 100%
    );
    border: 1px solid ${color('white-10')};
    color: ${color('white')};
  }

  &:focus-visible {
    outline: 1px solid ${color('blue')};
    outline-offset: 1px;
  }
`;

const TabIconBox = styled.span`
  border-radius: ${radius(1)};
  display: grid;
  height: ${spacing(6)};
  overflow: hidden;
  place-items: center;
  width: ${spacing(6)};

  & svg {
    display: block;
    max-height: 100%;
    max-width: 100%;
  }

  &[data-active='true'] {
    background-color: ${color('black-10')};
  }

  &[data-active='false'] {
    background-color: ${color('blue')};
  }
`;

export function TabButton({
  controls,
  id,
  isActive,
  onSelect,
  tab,
}: {
  controls: string;
  id: string;
  isActive: boolean;
  onSelect: () => void;
  tab: AiHeroTab;
}) {
  const { i18n } = useLingui();
  const Icon = TAB_ICONS[tab.icon];

  return (
    <StyledButton
      aria-controls={controls}
      aria-selected={isActive}
      data-active={String(isActive)}
      id={id}
      onClick={onSelect}
      role="tab"
      type="button"
    >
      <Label>{i18n._(tab.body)}</Label>
      <TabIconBox data-active={String(isActive)}>
        <Icon
          color={isActive ? color('blue') : color('white')}
          size={16}
          stroke={2}
        />
      </TabIconBox>
    </StyledButton>
  );
}
