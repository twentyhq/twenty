'use client';

import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { useRef, type ReactNode } from 'react';

import { TAB_LABEL_WIDTH } from './controls-form-constants';

export const SegmentedLabel = styled.div`
  align-items: center;
  display: grid;
  gap: 10px;
  grid-template-columns: ${TAB_LABEL_WIDTH}px minmax(0, 1fr);
`;

const SegmentedGroup = styled.div`
  align-items: stretch;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  display: grid;
  gap: 1px;
  grid-auto-columns: minmax(0, 1fr);
  grid-auto-flow: column;
  height: 24px;
  padding: 1px;
  width: 100%;
`;

const SegmentedButton = styled.button<{ $active: boolean }>`
  background: ${(props) =>
    props.$active ? 'rgba(255, 255, 255, 0.14)' : 'transparent'};
  border: none;
  border-radius: 6px;
  color: ${(props) =>
    props.$active ? 'rgba(255, 255, 255, 0.94)' : 'rgba(255, 255, 255, 0.58)'};
  cursor: pointer;
  font-family: ${theme.font.family.sans};
  font-size: 11px;
  font-weight: ${(props) => (props.$active ? 600 : 500)};
  height: 100%;
  padding: 0 10px;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;

  &:hover {
    color: rgba(255, 255, 255, 0.86);
  }

  &:focus-visible {
    outline: 1px solid rgba(255, 255, 255, 0.35);
    outline-offset: 1px;
  }
`;

type SegmentedControlProps = {
  children: ReactNode;
  onChange: (value: string) => void;
  value: string;
  options: Array<{ label: string; value: string }>;
};

export function SegmentedControl({
  children,
  onChange,
  options,
  value,
}: SegmentedControlProps) {
  const groupReference = useRef<HTMLDivElement>(null);

  const handleKeyDown = (event: React.KeyboardEvent, currentIndex: number) => {
    let nextIndex: number | null = null;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = (currentIndex + 1) % options.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = (currentIndex - 1 + options.length) % options.length;
    }

    if (nextIndex === null) {
      return;
    }

    event.preventDefault();
    onChange(options[nextIndex].value);

    const buttons =
      groupReference.current?.querySelectorAll<HTMLButtonElement>(
        '[role="radio"]',
      );
    buttons?.[nextIndex]?.focus();
  };

  return (
    <SegmentedLabel>
      <span>{children}</span>
      <SegmentedGroup
        aria-label={typeof children === 'string' ? children : undefined}
        ref={groupReference}
        role="radiogroup"
      >
        {options.map((option, index) => {
          const isActive = option.value === value;

          return (
            <SegmentedButton
              $active={isActive}
              aria-checked={isActive}
              key={option.value}
              onClick={() => {
                if (!isActive) {
                  onChange(option.value);
                }
              }}
              onKeyDown={(event) => handleKeyDown(event, index)}
              role="radio"
              tabIndex={isActive ? 0 : -1}
              type="button"
            >
              {option.label}
            </SegmentedButton>
          );
        })}
      </SegmentedGroup>
    </SegmentedLabel>
  );
}
