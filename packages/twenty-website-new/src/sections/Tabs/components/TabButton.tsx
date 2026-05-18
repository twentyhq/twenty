'use client';

import { useLingui } from '@lingui/react';
import { INFORMATIVE_ICONS } from '@/icons';
import type { TabType } from '@/sections/Tabs/types';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

const Label = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledButton = styled.button`
  align-items: center;
  border-radius: ${theme.radius(2)};
  box-sizing: border-box;
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
  text-align: left;
  transition:
    background-color 0.2s ease,
    background-image 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;

  &[data-active='true'] {
    background-color: ${theme.colors.primary.background[100]};
    border: 1px solid transparent;
    color: ${theme.colors.primary.text[100]};
  }

  &[data-active='false'] {
    background-color: ${theme.colors.secondary.background[100]};
    background-image: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.1) 0%,
      rgba(255, 255, 255, 0.1) 100%
    );
    border: 1px solid ${theme.colors.secondary.border[10]};
    color: ${theme.colors.secondary.text[100]};
  }

  &:focus-visible {
    outline: 1px solid ${theme.colors.highlight[100]};
    outline-offset: 1px;
  }
`;

const TabIconBox = styled.span`
  border-radius: ${theme.radius(1)};
  display: grid;
  height: ${theme.spacing(6)};
  overflow: hidden;
  place-items: center;
  width: ${theme.spacing(6)};

  & svg {
    display: block;
    max-height: 100%;
    max-width: 100%;
  }

  &[data-active='true'] {
    background-color: ${theme.colors.primary.text[10]};
  }

  &[data-active='false'] {
    background-color: ${theme.colors.highlight[100]};
  }
`;

type TabButtonProps = {
  controls: string;
  id: string;
  isActive: boolean;
  onSelect: () => void;
  tab: TabType;
};

export function TabButton({
  controls,
  id,
  isActive,
  onSelect,
  tab,
}: TabButtonProps) {
  const { i18n } = useLingui();

  const iconColor = isActive
    ? theme.colors.highlight[100]
    : theme.colors.secondary.text[100];

  const Icon = INFORMATIVE_ICONS[tab.icon as keyof typeof INFORMATIVE_ICONS];

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
        {Icon ? <Icon color={iconColor} size={16} /> : null}
      </TabIconBox>
    </StyledButton>
  );
}
