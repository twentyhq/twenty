'use client';

import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import * as Popover from '@radix-ui/react-popover';
import { IconChevronDown } from '@tabler/icons-react';

import { theme } from '@/theme';

type FilterDropdownProps<T extends string> = {
  label: MessageDescriptor;
  options: readonly T[];
  optionLabels: Record<T, MessageDescriptor>;
  selected: ReadonlySet<T>;
  onToggle: (value: T) => void;
};

const TriggerButton = styled.button`
  align-items: center;
  background: transparent;
  border: 1px solid ${theme.colors.primary.border[10]};
  border-radius: ${theme.radius(1.5)};
  color: ${theme.colors.primary.text[80]};
  cursor: pointer;
  display: inline-flex;
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3.5)};
  gap: ${theme.spacing(1.5)};
  line-height: ${theme.lineHeight(4)};
  padding: ${theme.spacing(1.5)} ${theme.spacing(3)};
  transition:
    background 120ms ease,
    border-color 120ms ease;
  white-space: nowrap;

  &[data-active='true'] {
    border-color: ${theme.colors.primary.border[40]};
    color: ${theme.colors.primary.text[100]};
  }

  &:hover {
    background: ${theme.colors.primary.text[5]};
  }

  &:focus-visible {
    outline: 2px solid ${theme.colors.primary.border[40]};
    outline-offset: 2px;
  }
`;

const ChevronIcon = styled(IconChevronDown)`
  color: ${theme.colors.primary.text[40]};
  flex-shrink: 0;
  transition: transform 180ms ease;

  [data-state='open'] & {
    transform: rotate(180deg);
  }
`;

const contentStyles = css`
  background: ${theme.colors.primary.background[100]};
  border: 1px solid ${theme.colors.primary.border[10]};
  border-radius: ${theme.radius(2)};
  box-shadow: 0 12px 32px -16px rgba(0, 0, 0, 0.18);
  min-width: 200px;
  overflow: hidden;
  padding: ${theme.spacing(2)};
  z-index: 50;
`;

const OptionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  max-height: 320px;
  overflow-y: auto;
`;

const OptionRow = styled.label`
  align-items: center;
  border-radius: ${theme.radius(1)};
  color: ${theme.colors.primary.text[80]};
  cursor: pointer;
  display: flex;
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3.5)};
  gap: ${theme.spacing(2)};
  line-height: ${theme.lineHeight(4)};
  padding: ${theme.spacing(1.5)} ${theme.spacing(2)};
  transition: background 100ms ease;
  user-select: none;

  &:hover {
    background: ${theme.colors.primary.text[5]};
  }
`;

const Checkbox = styled.input`
  accent-color: ${theme.colors.primary.text[100]};
  border: 1px solid ${theme.colors.primary.border[20]};
  border-radius: ${theme.radius(0.5)};
  cursor: pointer;
  flex-shrink: 0;
  height: 14px;
  margin: 0;
  width: 14px;
`;

export function FilterDropdown<T extends string>({
  label,
  options,
  optionLabels,
  selected,
  onToggle,
}: FilterDropdownProps<T>) {
  const { i18n } = useLingui();
  const labelText = i18n._(label);
  const hasSelection = selected.size > 0;

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <TriggerButton
          aria-label={
            hasSelection
              ? i18n._(
                  msg`${labelText} filter, ${selected.size} selected, click to open`,
                )
              : i18n._(msg`${labelText} filter, click to open`)
          }
          data-active={hasSelection ? 'true' : 'false'}
          type="button"
        >
          {hasSelection ? `${labelText} · ${selected.size}` : labelText}
          <ChevronIcon size={14} strokeWidth={2} />
        </TriggerButton>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content align="start" className={contentStyles} sideOffset={6}>
          <OptionList role="group" aria-label={labelText}>
            {options.map((option) => (
              <OptionRow key={option}>
                <Checkbox
                  checked={selected.has(option)}
                  onChange={() => onToggle(option)}
                  type="checkbox"
                />
                {i18n._(optionLabels[option])}
              </OptionRow>
            ))}
          </OptionList>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
