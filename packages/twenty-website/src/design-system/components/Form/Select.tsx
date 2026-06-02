'use client';

import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { IconChevronDown, IconSearch } from '@tabler/icons-react';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

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

// Positioned via inline style (fixed, anchored to the trigger) and portaled to
// <body> so the modal's overflow/transform can't clip it.
const Popup = styled.div`
  background: ${theme.colors.secondary.background[100]};
  border: 1px solid ${theme.colors.highlight[100]};
  border-radius: ${theme.radius(2)};
  box-shadow: 0 0 16px 0 rgba(15, 15, 15, 0.25);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: fixed;
  z-index: ${theme.zIndex.portalTop};
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

// Inline position for the portaled popup: pinned to the trigger, flipped up
// when there is more room above, height capped so it always fits the viewport.
type PopupPosition = {
  left: number;
  width: number;
  maxHeight: number;
  top?: number;
  bottom?: number;
};

const POPUP_GAP_PX = 4;
const VIEWPORT_MARGIN_PX = 8;
const POPUP_MAX_HEIGHT_PX = 320;

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
  const [position, setPosition] = useState<PopupPosition | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    const anchor = rootRef.current;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_MARGIN_PX;
    const spaceAbove = rect.top - VIEWPORT_MARGIN_PX;
    const openUp =
      spaceBelow < Math.min(POPUP_MAX_HEIGHT_PX, 220) &&
      spaceAbove > spaceBelow;
    // Clamp to the room actually available so the dropdown can't overflow a
    // short viewport; only grow toward POPUP_MAX_HEIGHT_PX when there's space.
    const available = Math.max(0, openUp ? spaceAbove : spaceBelow);
    const maxHeight = Math.min(POPUP_MAX_HEIGHT_PX, available);
    setPosition({
      left: rect.left,
      width: rect.width,
      maxHeight,
      ...(openUp
        ? { bottom: window.innerHeight - rect.top + POPUP_GAP_PX }
        : { top: rect.bottom + POPUP_GAP_PX }),
    });
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setPosition(null);
      return;
    }
    updatePosition();
    const reposition = () => updatePosition();
    // capture=true so the modal's own scroll container also triggers reposition.
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (popupRef.current?.contains(target)) return;
      setOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open, updatePosition]);

  const selectedOption = options.find((o) => o.value === value);
  const visibleOptions = searchable
    ? options.filter((o) => labelMatches(o.label, query))
    : options;

  const popupStyle: CSSProperties | undefined = position
    ? {
        left: position.left,
        width: position.width,
        maxHeight: position.maxHeight,
        ...(position.top !== undefined
          ? { top: position.top }
          : { bottom: position.bottom }),
      }
    : undefined;

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
        <Value
          data-empty={value === '' || !selectedOption ? 'true' : undefined}
        >
          {value === '' || !selectedOption ? placeholder : selectedOption.label}
        </Value>
        <IconChevronDown size={20} stroke={1.5} aria-hidden />
      </Trigger>
      {name ? <input type="hidden" name={name} value={value} /> : null}
      {open && popupStyle && typeof document !== 'undefined'
        ? createPortal(
            <Popup
              ref={popupRef}
              role="listbox"
              aria-label={ariaLabel}
              style={popupStyle}
              // Keep clicks inside the popup from reaching the modal's
              // outside-press handler (which would close the dialog).
              onMouseDown={(event) => event.stopPropagation()}
              onPointerDown={(event) => event.stopPropagation()}
            >
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
            </Popup>,
            document.body,
          )
        : null}
    </Root>
  );
}
