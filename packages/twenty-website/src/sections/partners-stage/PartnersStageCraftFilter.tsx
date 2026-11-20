'use client';

import { Popover } from '@base-ui/react/popover';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { IconChevronDown, IconX } from '@tabler/icons-react';

import {
  color,
  DURATION,
  EASING,
  fontFamily,
  fontSize,
  radius,
  REDUCED_MOTION,
  semanticColor,
  SHADOW,
  spacing,
  Z_INDEX,
} from '@/tokens';

// PROTOTYPE (?direction=e): the site's filter button
// (partners-marketplace/FilterDropdown) on the dark page, with a count per
// option and a Clear in the menu.
const Trigger = styled(Popover.Trigger)`
  align-items: center;
  background-color: transparent;
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(1.5)};
  color: ${color('white-80')};
  cursor: pointer;
  display: inline-flex;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  gap: ${spacing(1.5)};
  line-height: ${fontSize(4)};
  padding: ${spacing(1.5)} ${spacing(3)};
  transition:
    background-color ${DURATION.xxs} ${EASING.gentle},
    border-color ${DURATION.xxs} ${EASING.gentle},
    color ${DURATION.xxs} ${EASING.gentle};
  white-space: nowrap;

  &:hover {
    background-color: ${color('white-5')};
  }

  &[data-active] {
    border-color: ${color('white-40')};
    color: ${semanticColor.ink};
  }

  &:focus-visible {
    outline: 2px solid ${color('white-40')};
    outline-offset: 2px;
  }

  ${REDUCED_MOTION} {
    transition: none;
  }
`;

// Active, the filter reads as one control in two parts, as in Notion and
// Attio: "Languages: French, German" opens the menu, the cross clears it.
const Control = styled.span`
  display: inline-flex;

  &[data-active] > ${Trigger} {
    border-bottom-right-radius: 0;
    border-right: none;
    border-top-right-radius: 0;
  }
`;

const SummaryLabel = styled.span`
  color: ${semanticColor.inkMuted};
`;

const SummaryValues = styled.span`
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ClearSegment = styled.button`
  align-items: center;
  background-color: transparent;
  border: 1px solid ${color('white-40')};
  border-bottom-right-radius: ${radius(1.5)};
  border-top-right-radius: ${radius(1.5)};
  color: ${semanticColor.inkSubtle};
  cursor: pointer;
  display: inline-flex;
  padding: 0 ${spacing(2)};
  transition:
    background-color ${DURATION.xxs} ${EASING.gentle},
    color ${DURATION.xxs} ${EASING.gentle};

  &:hover {
    background-color: ${color('white-5')};
    color: ${semanticColor.ink};
  }

  &:focus-visible {
    outline: 2px solid ${color('white-40')};
    outline-offset: 2px;
  }

  ${REDUCED_MOTION} {
    transition: none;
  }
`;

const Chevron = styled.span`
  color: ${semanticColor.inkSubtle};
  display: inline-flex;
  transition: transform ${DURATION.xs} ${EASING.standard};

  [data-popup-open] > & {
    transform: rotate(180deg);
  }
`;

const Positioner = styled(Popover.Positioner)`
  z-index: ${Z_INDEX.portal};
`;

const Popup = styled(Popover.Popup)`
  background-color: ${color('charcoal')};
  border: 1px solid ${color('white-10')};
  border-radius: ${radius(2)};
  box-shadow:
    inset 0 1px 0 ${color('white-10')},
    ${SHADOW.popupDark};
  min-width: 240px;
  overflow: hidden;
  padding: ${spacing(2)};
  transform-origin: var(--transform-origin);
  transition:
    opacity ${DURATION.xs} ${EASING.gentle},
    transform ${DURATION.xs} ${EASING.standard};

  &[data-starting-style],
  &[data-ending-style] {
    opacity: 0;
    transform: translateY(-4px) scale(0.98);
  }

  ${REDUCED_MOTION} {
    transition: none;
  }
`;

// Tall enough for every option; on a short screen it scrolls with a thin
// dark bar instead of the system's light one.
const OptionList = styled.div`
  display: flex;
  flex-direction: column;
  max-height: min(480px, calc(var(--available-height) - 64px));
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-color: ${color('white-20')} transparent;
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${color('white-20')};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
`;

const OptionRow = styled.label`
  align-items: center;
  border-radius: ${radius(1.5)};
  color: ${color('white-80')};
  cursor: pointer;
  display: flex;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  gap: ${spacing(2.5)};
  line-height: 18px;
  padding: ${spacing(2)} ${spacing(2.5)};
  transition: background-color ${DURATION.xxs} ${EASING.gentle};
  user-select: none;

  &:hover {
    background-color: ${color('white-5')};
  }

  &[data-disabled] {
    cursor: default;
    opacity: 0.35;
  }
`;

// A drawn box: the native control stays for keyboard and screen readers.
const Checkbox = styled.input`
  appearance: none;
  border: 1px solid ${color('white-40')};
  border-radius: ${radius(0.5)};
  cursor: inherit;
  flex-shrink: 0;
  height: 14px;
  position: relative;
  width: 14px;

  &:checked {
    background-color: ${color('white')};
    border-color: ${color('white')};
  }

  &:checked::after {
    border: solid ${color('black')};
    border-width: 0 1.5px 1.5px 0;
    content: '';
    height: 7px;
    left: 4px;
    position: absolute;
    top: 1px;
    transform: rotate(45deg);
    width: 3px;
  }

  &:focus-visible {
    outline: 1px solid ${color('blue')};
    outline-offset: 2px;
  }
`;

const OptionLabel = styled.span`
  flex: 1 1 auto;
`;

// The popup renders in a portal, outside the dark section: colours are
// spelled out, not taken from the scheme.
const OptionCount = styled.span`
  color: ${color('white-40')};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  font-variant-numeric: tabular-nums;
`;

const Footer = styled.div`
  border-top: 1px solid ${color('white-10')};
  display: flex;
  justify-content: flex-end;
  margin-top: ${spacing(2)};
  padding: ${spacing(2)} ${spacing(1)} 0;
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  color: ${color('white-60')};
  cursor: pointer;
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(2.75)};
  letter-spacing: 0.08em;
  padding: ${spacing(1)};
  text-transform: uppercase;

  &:hover {
    color: ${color('white')};
  }
`;

export type PartnersStageCraftFilterOption = {
  value: string;
  label: string;
  count: number;
};

type PartnersStageCraftFilterProps = {
  label: string;
  onClear: () => void;
  onToggle: (value: string) => void;
  options: readonly PartnersStageCraftFilterOption[];
  selected: ReadonlySet<string>;
};

export function PartnersStageCraftFilter({
  label,
  onClear,
  onToggle,
  options,
  selected,
}: PartnersStageCraftFilterProps) {
  const { i18n } = useLingui();
  const chosen = options.filter((option) => selected.has(option.value));
  const values =
    chosen.length > 2
      ? `${chosen
          .slice(0, 2)
          .map((option) => option.label)
          .join(', ')} +${chosen.length - 2}`
      : chosen.map((option) => option.label).join(', ');

  return (
    <Control data-active={chosen.length > 0 ? '' : undefined}>
      <Popover.Root>
        <Trigger
          aria-label={
            chosen.length > 0
              ? i18n._(msg`${label} filter, ${chosen.length} selected`)
              : i18n._(msg`${label} filter`)
          }
          data-active={chosen.length > 0 ? '' : undefined}
        >
          {chosen.length === 0 ? (
            label
          ) : (
            <>
              <SummaryLabel>{`${label}:`}</SummaryLabel>
              <SummaryValues>{values}</SummaryValues>
            </>
          )}
          <Chevron aria-hidden>
            <IconChevronDown size={14} strokeWidth={2} />
          </Chevron>
        </Trigger>
        <Popover.Portal>
          <Positioner align="start" side="bottom" sideOffset={8}>
            <Popup>
              <OptionList aria-label={label} role="group">
                {options.map((option) => {
                  const isDisabled =
                    option.count === 0 && !selected.has(option.value);

                  return (
                    <OptionRow
                      data-disabled={isDisabled ? '' : undefined}
                      key={option.value}
                    >
                      <Checkbox
                        checked={selected.has(option.value)}
                        disabled={isDisabled}
                        onChange={() => onToggle(option.value)}
                        type="checkbox"
                      />
                      <OptionLabel>{option.label}</OptionLabel>
                      <OptionCount>{option.count}</OptionCount>
                    </OptionRow>
                  );
                })}
              </OptionList>
              {chosen.length > 0 && (
                <Footer>
                  <ClearButton onClick={onClear} type="button">
                    {i18n._(msg`Clear filters`)}
                  </ClearButton>
                </Footer>
              )}
            </Popup>
          </Positioner>
        </Popover.Portal>
      </Popover.Root>
      {chosen.length > 0 && (
        <ClearSegment
          aria-label={i18n._(msg`Clear ${label} filter`)}
          onClick={onClear}
          type="button"
        >
          <IconX aria-hidden size={12} strokeWidth={2} />
        </ClearSegment>
      )}
    </Control>
  );
}
