'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { IconX } from '@tabler/icons-react';

import {
  color,
  fontFamily,
  fontSize,
  radius,
  semanticColor,
  spacing,
} from '@/tokens';

export type ActivePill = {
  key: string;
  text: string;
  onRemove: () => void;
};

const PillsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(1.5)};
`;

const Pill = styled.span`
  align-items: center;
  background: ${color('black-5')};
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(4)};
  color: ${color('black-80')};
  display: inline-flex;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3)};
  gap: ${spacing(1)};
  line-height: ${fontSize(4)};
  padding: ${spacing(0.5)} ${spacing(1.5)};
`;

const RemoveButton = styled.button`
  align-items: center;
  background: transparent;
  border: none;
  color: ${semanticColor.inkSubtle};
  cursor: pointer;
  display: inline-flex;
  flex-shrink: 0;
  margin: 0;
  padding: 0;
  transition: color 100ms ease;

  &:hover {
    color: ${semanticColor.ink};
  }

  &:focus-visible {
    border-radius: ${radius(0.5)};
    outline: 2px solid ${color('black-40')};
    outline-offset: 2px;
  }
`;

export function ActiveFilterPills({ pills }: { pills: readonly ActivePill[] }) {
  const { i18n } = useLingui();

  if (pills.length === 0) return null;

  return (
    <PillsRow aria-label={i18n._(msg`Active filters`)}>
      {pills.map((pill) => (
        <Pill key={pill.key}>
          {pill.text}
          <RemoveButton
            aria-label={i18n._(msg`Remove ${pill.text} filter`)}
            onClick={pill.onRemove}
            type="button"
          >
            <IconX size={12} strokeWidth={2} aria-hidden="true" />
          </RemoveButton>
        </Pill>
      ))}
    </PillsRow>
  );
}
