'use client';

import { styled } from '@linaria/react';
import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { ChevronDown, Search } from '@/icons';
import {
  buildSchemeDeclarations,
  color,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  radius,
  type Scheme,
  semanticColor,
  SHADOW,
  spacing,
  Z_INDEX,
} from '@/tokens';

export type SelectOption<TValue extends string> = {
  label: string;
  value: TValue;
};

const Root = styled.div`
  position: relative;
  width: 100%;
`;

const Trigger = styled.button`
  align-items: center;
  background: none;
  border: 1px solid ${semanticColor.lineStrong};
  border-radius: ${radius(2)};
  color: ${semanticColor.ink};
  cursor: pointer;
  display: flex;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
  font-weight: ${FONT_WEIGHT.regular};
  gap: ${spacing(2)};
  height: clamp(40px, 5.5vh, 56px);
  justify-content: space-between;
  padding: 0 ${spacing(2)} 0 ${spacing(3)};
  width: 100%;

  &[data-invalid] {
    border-color: ${color('error')};
  }

  &:focus-visible {
    border-color: ${color('blue')};
    outline: none;
  }
`;

const Value = styled.span`
  flex: 1 1 auto;
  overflow: hidden;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;

  &[data-empty] {
    color: ${semanticColor.inkSubtle};
  }
`;

const Chevron = styled.span`
  align-items: center;
  color: ${semanticColor.inkMuted};
  display: flex;
  flex: none;
`;

// Portaled to <body>, so it re-declares the scheme from the scheme prop (the
// portal escapes the consumer's scheme vars — NotchedCardShape precedent).
const Popup = styled.div`
  background: ${semanticColor.surface};
  border: 1px solid ${color('blue')};
  border-radius: ${radius(2)};
  box-shadow: ${SHADOW.popupDark};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: fixed;
  z-index: ${Z_INDEX.portal};

  &[data-scheme='light'] {
    ${buildSchemeDeclarations('light')}
  }

  &[data-scheme='muted'] {
    ${buildSchemeDeclarations('muted')}
  }

  &[data-scheme='dark'] {
    ${buildSchemeDeclarations('dark')}
  }
`;

const SearchRow = styled.div`
  align-items: center;
  border-bottom: 1px solid ${semanticColor.lineStrong};
  color: ${semanticColor.inkMuted};
  display: flex;
  flex-shrink: 0;
  gap: ${spacing(2)};
  padding: ${spacing(2)} ${spacing(3)};
`;

const SearchControl = styled.input`
  background: none;
  border: none;
  color: ${semanticColor.ink};
  flex: 1 1 auto;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};

  &::placeholder {
    color: ${semanticColor.inkSubtle};
  }

  &:focus {
    outline: none;
  }
`;

const OptionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
  padding: ${spacing(1)};
`;

const Option = styled.button`
  background: none;
  border: none;
  border-radius: ${radius(1)};
  color: ${semanticColor.ink};
  cursor: pointer;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
  padding: ${spacing(2)} ${spacing(3)};
  text-align: left;
  width: 100%;

  &[data-selected] {
    background: ${color('blue-40')};
  }

  &:hover {
    background: ${color('blue-20')};
  }

  &:focus-visible {
    outline: 2px solid ${color('blue')};
    outline-offset: -2px;
  }
`;

const EmptyState = styled.span`
  color: ${semanticColor.inkSubtle};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
  padding: ${spacing(3)};
`;

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

function labelMatches(label: string, query: string): boolean {
  if (query === '') return true;
  return label.toLowerCase().includes(query.toLowerCase());
}

// A single-select dropdown: a button trigger + a portaled popup. `searchable`
// adds an in-popup filter row. The consumer works in plain value strings.
export function Select<TValue extends string>({
  ariaLabel,
  emptyLabel,
  invalid = false,
  onValueChange,
  options,
  placeholder,
  scheme = 'light',
  searchable = false,
  searchPlaceholder,
  value,
}: {
  ariaLabel: string;
  emptyLabel?: string;
  invalid?: boolean;
  onValueChange: (value: TValue) => void;
  options: readonly SelectOption<TValue>[];
  placeholder: string;
  scheme?: Scheme;
  searchable?: boolean;
  searchPlaceholder?: string;
  value: TValue | '';
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [position, setPosition] = useState<PopupPosition | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    const anchor = rootRef.current;
    if (anchor === null) return;
    const rect = anchor.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_MARGIN_PX;
    const spaceAbove = rect.top - VIEWPORT_MARGIN_PX;
    const openUp =
      spaceBelow < Math.min(POPUP_MAX_HEIGHT_PX, 220) &&
      spaceAbove > spaceBelow;
    const available = Math.max(0, openUp ? spaceAbove : spaceBelow);
    setPosition({
      left: rect.left,
      width: rect.width,
      maxHeight: Math.min(POPUP_MAX_HEIGHT_PX, available),
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
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    const handlePointer = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) === true) return;
      if (popupRef.current?.contains(target) === true) return;
      setOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open, updatePosition]);

  const selectedOption = options.find((option) => option.value === value);
  const visibleOptions = searchable
    ? options.filter((option) => labelMatches(option.label, query))
    : options;

  const popupStyle: CSSProperties | undefined =
    position === null
      ? undefined
      : {
          left: position.left,
          width: position.width,
          maxHeight: position.maxHeight,
          ...(position.top !== undefined
            ? { top: position.top }
            : { bottom: position.bottom }),
        };

  const triggerLabel: ReactNode =
    value === '' || selectedOption === undefined
      ? placeholder
      : selectedOption.label;

  return (
    <Root ref={rootRef}>
      <Trigger
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        data-invalid={invalid ? '' : undefined}
        onClick={() => setOpen((previous) => !previous)}
        type="button"
      >
        <Value
          data-empty={
            value === '' || selectedOption === undefined ? '' : undefined
          }
        >
          {triggerLabel}
        </Value>
        <Chevron aria-hidden>
          <ChevronDown sizePx={18} />
        </Chevron>
      </Trigger>
      {open && popupStyle !== undefined && typeof document !== 'undefined'
        ? createPortal(
            <Popup
              aria-label={ariaLabel}
              data-scheme={scheme}
              onMouseDown={(event) => event.stopPropagation()}
              onPointerDown={(event) => event.stopPropagation()}
              ref={popupRef}
              role="listbox"
              style={popupStyle}
            >
              {searchable ? (
                <SearchRow>
                  <Search sizePx={16} />
                  <SearchControl
                    autoFocus
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={searchPlaceholder}
                    type="text"
                    value={query}
                  />
                </SearchRow>
              ) : null}
              <OptionList>
                {visibleOptions.length === 0 ? (
                  <EmptyState>{emptyLabel ?? '—'}</EmptyState>
                ) : (
                  visibleOptions.map((option) => (
                    <Option
                      aria-selected={value === option.value}
                      data-selected={value === option.value ? '' : undefined}
                      key={option.value}
                      onClick={() => {
                        onValueChange(option.value);
                        setOpen(false);
                      }}
                      role="option"
                      type="button"
                    >
                      {option.label}
                    </Option>
                  ))
                )}
              </OptionList>
            </Popup>,
            document.body,
          )
        : null}
    </Root>
  );
}
