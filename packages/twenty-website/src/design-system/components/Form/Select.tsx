'use client';

import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { IconChevronDown, IconSearch } from '@tabler/icons-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';

export type FormSelectOption<TValue extends string> = {
  value: TValue;
  label: ReactNode;
};

const Root = styled.div`
  position: relative;
  width: 100%;
`;

const Trigger = styled.button`
  align-items: center;
  background: transparent;
  border: 1px solid ${theme.colors.secondary.border[20]};
  border-radius: ${theme.radius(2)};
  box-sizing: border-box;
  color: ${theme.colors.secondary.text[100]};
  cursor: pointer;
  display: flex;
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(4)};
  font-weight: ${theme.font.weight.regular};
  gap: ${theme.spacing(2)};
  height: clamp(40px, 5.5vh, 56px);
  justify-content: space-between;
  padding-left: ${theme.spacing(3)};
  padding-right: ${theme.spacing(2)};
  width: 100%;

  &[data-invalid='true'] {
    border-color: #ff9a9a;
  }

  &:focus-visible {
    border-color: ${theme.colors.highlight[100]};
    outline: none;
  }
`;

const Value = styled.span`
  color: ${theme.colors.secondary.text[100]};
  flex: 1 1 auto;
  overflow: hidden;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;

  &[data-empty='true'] {
    color: ${theme.colors.secondary.text[40]};
  }
`;

const Popup = styled.div`
  background: ${theme.colors.secondary.background[100]};
  border: 1px solid ${theme.colors.highlight[100]};
  border-radius: ${theme.radius(2)};
  box-shadow: 0 0 16px 0 rgba(15, 15, 15, 0.25);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  left: 0;
  margin-top: ${theme.spacing(1)};
  max-height: 320px;
  overflow: hidden;
  position: absolute;
  right: 0;
  top: 100%;
  z-index: 10;
`;

const SearchRow = styled.div`
  align-items: center;
  border-bottom: 1px solid ${theme.colors.secondary.border[20]};
  color: ${theme.colors.secondary.text[60]};
  display: flex;
  flex-shrink: 0;
  gap: ${theme.spacing(2)};
  padding: ${theme.spacing(2)} ${theme.spacing(3)};
`;

const SearchInput = styled.input`
  background: transparent;
  border: none;
  color: ${theme.colors.secondary.text[100]};
  flex: 1 1 auto;
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(4)};
  outline: none;

  &::placeholder {
    color: ${theme.colors.secondary.text[40]};
  }
`;

const OptionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
  padding: ${theme.spacing(1)};
`;

const Option = styled.button`
  align-items: center;
  background: transparent;
  border: none;
  border-radius: ${theme.radius(1)};
  color: ${theme.colors.secondary.text[100]};
  cursor: pointer;
  display: flex;
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(4)};
  padding: ${theme.spacing(2)} ${theme.spacing(3)};
  text-align: left;
  width: 100%;

  &[data-selected='true'] {
    background: rgba(74, 56, 245, 0.3);
  }

  &:hover {
    background: rgba(74, 56, 245, 0.15);
  }

  &:focus-visible {
    outline: 2px solid ${theme.colors.highlight[100]};
    outline-offset: -2px;
  }
`;

const EmptyState = styled.span`
  color: ${theme.colors.secondary.text[40]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3.5)};
  padding: ${theme.spacing(3)};
`;

type FormSelectProps<TValue extends string> = {
  value: TValue | '';
  onValueChange: (value: TValue) => void;
  placeholder: ReactNode;
  options: ReadonlyArray<FormSelectOption<TValue>>;
  invalid?: boolean;
  name?: string;
  ariaLabel?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchEmptyLabel?: string;
};

function labelMatches(label: ReactNode, query: string): boolean {
  if (query === '') return true;
  if (typeof label !== 'string') return true;
  return label.toLowerCase().includes(query.toLowerCase());
}

export function FormSelect<TValue extends string>({
  value,
  onValueChange,
  placeholder,
  options,
  invalid,
  name,
  ariaLabel,
  searchable,
  searchPlaceholder,
  searchEmptyLabel,
}: FormSelectProps<TValue>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setQuery('');
      return;
    }
    const handleClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const selectedOption = options.find((o) => o.value === value);
  const visibleOptions = searchable
    ? options.filter((o) => labelMatches(o.label, query))
    : options;

  return (
    <Root ref={rootRef}>
      <Trigger
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        data-invalid={invalid ? 'true' : undefined}
        onClick={() => setOpen((v) => !v)}
      >
        <Value data-empty={value === '' || !selectedOption ? 'true' : undefined}>
          {value === '' || !selectedOption ? placeholder : selectedOption.label}
        </Value>
        <IconChevronDown size={20} stroke={1.5} aria-hidden />
      </Trigger>
      {name ? <input type="hidden" name={name} value={value} /> : null}
      {open && (
        <Popup role="listbox" aria-label={ariaLabel}>
          {searchable && (
            <SearchRow>
              <IconSearch size={16} stroke={1.5} aria-hidden />
              <SearchInput
                autoFocus
                type="text"
                placeholder={searchPlaceholder}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </SearchRow>
          )}
          <OptionList>
            {visibleOptions.length === 0 ? (
              <EmptyState>{searchEmptyLabel ?? '—'}</EmptyState>
            ) : (
              visibleOptions.map((option) => {
                const selected = value === option.value;
                return (
                  <Option
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    data-selected={selected ? 'true' : undefined}
                    onClick={() => {
                      onValueChange(option.value);
                      setOpen(false);
                    }}
                  >
                    {option.label}
                  </Option>
                );
              })
            )}
          </OptionList>
        </Popup>
      )}
    </Root>
  );
}
