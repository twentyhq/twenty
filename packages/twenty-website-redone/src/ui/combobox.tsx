'use client';

import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import { styled } from '@linaria/react';

import { ChevronDown } from '@/icons';
import {
  color,
  fontFamily,
  radius,
  semanticColor,
  SHADOW,
  spacing,
  typeRampDeclarations,
  Z_INDEX,
} from '@/tokens';

export type ComboboxItem<TValue extends string> = {
  label: string;
  value: TValue;
};

const Group = styled(BaseCombobox.InputGroup)`
  align-items: center;
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  display: flex;
  padding-right: ${spacing(2)};
  width: 100%;

  &:focus-within {
    border-color: ${color('blue')};
  }

  &[data-invalid] {
    border-color: ${color('error')};
  }
`;

const Control = styled(BaseCombobox.Input)`
  ${typeRampDeclarations('bodySm')}
  background: none;
  border: none;
  color: ${semanticColor.ink};
  flex: 1;
  font-family: ${fontFamily('sans')};
  min-width: 0;
  padding: ${spacing(2.5)} ${spacing(3)};

  &::placeholder {
    color: ${semanticColor.inkMuted};
  }

  &:focus {
    outline: none;
  }
`;

const Trigger = styled(BaseCombobox.Trigger)`
  align-items: center;
  background: none;
  border: none;
  color: ${semanticColor.inkMuted};
  cursor: pointer;
  display: flex;
  flex: none;
  padding: 0;
`;

const Positioner = styled(BaseCombobox.Positioner)`
  width: var(--anchor-width);
  z-index: ${Z_INDEX.portal};
`;

const Popup = styled(BaseCombobox.Popup)`
  background: ${semanticColor.surface};
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  box-shadow: ${SHADOW.popupDark};
  max-height: 280px;
  overflow-y: auto;
  padding: ${spacing(1)};
`;

const Option = styled(BaseCombobox.Item)`
  ${typeRampDeclarations('bodySm')}
  border-radius: ${radius(1)};
  color: ${semanticColor.ink};
  cursor: pointer;
  font-family: ${fontFamily('sans')};
  padding: ${spacing(1.5)} ${spacing(2)};

  &[data-highlighted] {
    background: ${semanticColor.line};
  }

  &[data-selected] {
    color: ${color('blue')};
  }
`;

const Empty = styled(BaseCombobox.Empty)`
  ${typeRampDeclarations('bodySm')}
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
  padding: ${spacing(2)};
`;

// A searchable single-select on Base UI's headless combobox: the consumer works
// in plain value strings; the item objects are an internal detail. Filtering is
// automatic from `items` against the typed text.
export function Combobox<TValue extends string>({
  ariaLabel,
  emptyLabel,
  invalid = false,
  items,
  onValueChange,
  placeholder,
  searchPlaceholder,
  value,
}: {
  ariaLabel: string;
  emptyLabel: string;
  invalid?: boolean;
  items: readonly ComboboxItem<TValue>[];
  onValueChange: (value: TValue | '') => void;
  placeholder: string;
  searchPlaceholder: string;
  value: TValue | '';
}) {
  const selectedItem = items.find((item) => item.value === value) ?? null;

  return (
    <BaseCombobox.Root
      items={items}
      itemToStringLabel={(item) => item.label}
      onValueChange={(item) => onValueChange(item ? item.value : '')}
      value={selectedItem}
    >
      <Group data-invalid={invalid ? '' : undefined}>
        <Control
          aria-label={ariaLabel}
          placeholder={value === '' ? placeholder : searchPlaceholder}
        />
        <Trigger aria-label={placeholder}>
          <ChevronDown sizePx={14} />
        </Trigger>
      </Group>
      <BaseCombobox.Portal>
        <Positioner sideOffset={4}>
          <Popup>
            <Empty>{emptyLabel}</Empty>
            <BaseCombobox.List>
              {(item: ComboboxItem<TValue>) => (
                <Option key={item.value} value={item}>
                  {item.label}
                </Option>
              )}
            </BaseCombobox.List>
          </Popup>
        </Positioner>
      </BaseCombobox.Portal>
    </BaseCombobox.Root>
  );
}
