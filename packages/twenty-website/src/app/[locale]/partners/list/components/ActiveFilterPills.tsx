'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { IconX } from '@tabler/icons-react';

import { theme } from '@/theme';

export type ActivePill = {
  key: string;
  text: string;
  onRemove: () => void;
};

export type ActiveFilterPillsProps = {
  pills: readonly ActivePill[];
};

const PillsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing(1.5)};
`;

const Pill = styled.span`
  align-items: center;
  background: ${theme.colors.primary.text[5]};
  border: 1px solid ${theme.colors.primary.border[10]};
  border-radius: ${theme.radius(4)};
  color: ${theme.colors.primary.text[80]};
  display: inline-flex;
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3)};
  gap: ${theme.spacing(1)};
  line-height: ${theme.lineHeight(4)};
  padding: ${theme.spacing(0.5)} ${theme.spacing(1.5)};
`;

const RemoveButton = styled.button`
  align-items: center;
  background: transparent;
  border: none;
  color: ${theme.colors.primary.text[40]};
  cursor: pointer;
  display: inline-flex;
  flex-shrink: 0;
  margin: 0;
  padding: 0;
  transition: color 100ms ease;

  &:hover {
    color: ${theme.colors.primary.text[100]};
  }

  &:focus-visible {
    outline: 2px solid ${theme.colors.primary.border[40]};
    outline-offset: 2px;
    border-radius: ${theme.radius(0.5)};
  }
`;

export function ActiveFilterPills({ pills }: ActiveFilterPillsProps) {
  const { i18n } = useLingui();

  if (pills.length === 0) {
    return null;
  }

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
            <IconX size={12} strokeWidth={2} />
          </RemoveButton>
        </Pill>
      ))}
    </PillsRow>
  );
}
