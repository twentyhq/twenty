'use client';

import { Popover } from '@base-ui/react/popover';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { IconChevronDown } from '@tabler/icons-react';

import {
  color,
  fontFamily,
  fontSize,
  radius,
  semanticColor,
  SHADOW,
  spacing,
  Z_INDEX,
} from '@/tokens';

import { type FilterFacet } from './filter-facet';

// The partners directory's production filter menu (partners-marketplace/
// FilterDropdown on main), taking plain labels so any list can use it.

const Chevron = styled.span`
  align-items: center;
  color: ${semanticColor.inkSubtle};
  display: inline-flex;
  flex-shrink: 0;
  transition: transform 180ms ease;
`;

const Trigger = styled(Popover.Trigger)`
  align-items: center;
  background: transparent;
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(1.5)};
  color: ${color('black-80')};
  cursor: pointer;
  display: inline-flex;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  gap: ${spacing(1.5)};
  line-height: ${fontSize(4)};
  padding: ${spacing(1.5)} ${spacing(3)};
  transition:
    background 120ms ease,
    border-color 120ms ease;
  white-space: nowrap;

  &[data-active] {
    border-color: ${color('black-40')};
    color: ${semanticColor.ink};
  }

  &:hover {
    background: ${color('black-5')};
  }

  &:focus-visible {
    outline: 2px solid ${color('black-40')};
    outline-offset: 2px;
  }

  &[data-popup-open] ${Chevron} {
    transform: rotate(180deg);
  }
`;

const Positioner = styled(Popover.Positioner)`
  z-index: ${Z_INDEX.portal};
`;

const Popup = styled(Popover.Popup)`
  background: ${color('white')};
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  box-shadow: ${SHADOW.card};
  min-width: 200px;
  overflow: hidden;
  padding: ${spacing(2)};
`;

const OptionList = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 320px;
  overflow-y: auto;
`;

const OptionRow = styled.label`
  align-items: center;
  border-radius: ${radius(1)};
  color: ${color('black-80')};
  cursor: pointer;
  display: flex;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  gap: ${spacing(2)};
  line-height: ${fontSize(4)};
  padding: ${spacing(1.5)} ${spacing(2)};
  transition: background 100ms ease;
  user-select: none;

  &:hover {
    background: ${color('black-5')};
  }
`;

const Checkbox = styled.input`
  accent-color: ${color('black')};
  border: 1px solid ${semanticColor.lineStrong};
  border-radius: ${radius(0.5)};
  cursor: pointer;
  flex-shrink: 0;
  height: 14px;
  width: 14px;
`;

type FilterDropdownProps = {
  facet: FilterFacet;
  onToggle: (value: string) => void;
};

export function FilterDropdown({ facet, onToggle }: FilterDropdownProps) {
  const { i18n } = useLingui();
  const { label, options, selected } = facet;
  const hasSelection = selected.size > 0;

  return (
    <Popover.Root>
      <Trigger
        aria-label={
          hasSelection
            ? i18n._(msg`${label} filter, ${selected.size} selected`)
            : i18n._(msg`${label} filter`)
        }
        data-active={hasSelection ? '' : undefined}
      >
        {hasSelection ? `${label} · ${selected.size}` : label}
        <Chevron aria-hidden>
          <IconChevronDown size={14} strokeWidth={2} />
        </Chevron>
      </Trigger>
      <Popover.Portal>
        <Positioner align="start" side="bottom" sideOffset={6}>
          <Popup>
            <OptionList aria-label={label} role="group">
              {options.map((option) => (
                <OptionRow key={option.value}>
                  <Checkbox
                    checked={selected.has(option.value)}
                    onChange={() => onToggle(option.value)}
                    type="checkbox"
                  />
                  {option.label}
                </OptionRow>
              ))}
            </OptionList>
          </Popup>
        </Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
