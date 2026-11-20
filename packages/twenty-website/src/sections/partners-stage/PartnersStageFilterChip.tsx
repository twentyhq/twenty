'use client';

import { styled } from '@linaria/react';

import {
  color,
  DURATION,
  EASING,
  fontFamily,
  fontSize,
  radius,
  REDUCED_MOTION,
  semanticColor,
  spacing,
} from '@/tokens';

const ChipButton = styled.button`
  align-items: center;
  background-color: transparent;
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(1.5)};
  color: ${color('black-80')};
  cursor: pointer;
  display: inline-flex;
  flex-shrink: 0;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  gap: ${spacing(2)};
  line-height: ${fontSize(4)};
  padding: ${spacing(1.5)} ${spacing(3)};
  transition:
    background-color ${DURATION.xxs} ${EASING.gentle},
    border-color ${DURATION.xxs} ${EASING.gentle},
    color ${DURATION.xxs} ${EASING.gentle},
    transform ${DURATION.xxs} ${EASING.standard};
  white-space: nowrap;

  &:hover {
    background-color: ${color('black-5')};
    border-color: ${semanticColor.lineStrong};
  }

  &:active {
    transform: scale(0.97);
  }

  &[aria-pressed='true'] {
    background-color: ${color('black')};
    border-color: ${color('black')};
    color: ${color('white')};
  }

  &:focus-visible {
    outline: 2px solid ${color('blue')};
    outline-offset: 2px;
  }

  &:disabled {
    cursor: default;
    opacity: 0.4;
  }

  ${REDUCED_MOTION} {
    transition: none;

    &:active {
      transform: none;
    }
  }
`;

const ChipCount = styled.span`
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(2.75)};
  opacity: 0.55;
`;

type PartnersStageFilterChipProps = {
  count: number;
  isSelected: boolean;
  label: string;
  onToggle: () => void;
};

// PROTOTYPE
export function PartnersStageFilterChip({
  count,
  isSelected,
  label,
  onToggle,
}: PartnersStageFilterChipProps) {
  return (
    <ChipButton
      aria-pressed={isSelected}
      disabled={count === 0 && !isSelected}
      onClick={onToggle}
      type="button"
    >
      {label}
      <ChipCount>{count}</ChipCount>
    </ChipButton>
  );
}
