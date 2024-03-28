import {
  ChangeEvent,
  ClipboardEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import styled from '@emotion/styled';
import { Key } from 'ts-key-enum';

import { useListenClickOutside, useScopedHotkeys } from 'src/utilities';
import { isDefined } from 'src/utils';

import { StyledTextInput } from './FieldTextInput';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;

  input {
    width: ${({ theme }) => theme.spacing(24)};
  }

  & > input:last-child {
    border-left: 1px solid ${({ theme }) => theme.border.color.medium};
    padding-left: ${({ theme }) => theme.spacing(2)};
  }
`;

export type DoubleTextValue = {
  firstValue: string;
  secondValue: string;
};

type DoubleTextInputProps = {
  firstValue: string;
  secondValue: string;
  firstValuePlaceholder: string;
  secondValuePlaceholder: string;
  hotkeyScope: string;
  onEnter: (newDoubleTextValue: DoubleTextValue) => void;
  onEscape: (newDoubleTextValue: DoubleTextValue) => void;
  onTab?: (newDoubleTextValue: DoubleTextValue) => void;
  onShiftTab?: (newDoubleTextValue: DoubleTextValue) => void;
  onClickOutside: (
    event: MouseEvent | TouchEvent,
    newDoubleTextValue: DoubleTextValue,
  ) => void;
  onChange?: (newDoubleTextValue: DoubleTextValue) => void;
  onPaste?: (newDoubleTextValue: DoubleTextValue) => void;
};

export const DoubleTextInput = ({
  firstValue,
  secondValue,
  firstValuePlaceholder,
  secondValuePlaceholder,
  hotkeyScope,
  onClickOutside,
  onEnter,
  onEscape,
  onShiftTab,
  onTab,
  onChange,
  onPaste,
}: DoubleTextInputProps) => {
  const [firstInternalValue, setFirstInternalValue] = useState(firstValue);
  const [secondInternalValue, setSecondInternalValue] = useState(secondValue);

  const firstValueInputRef = useRef<HTMLInputElement>(null);
  const secondValueInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFirstInternalValue(firstValue);
    setSecondInternalValue(secondValue);
  }, [firstValue, secondValue]);

  const handleChange = (
    newFirstValue: string,
    newSecondValue: string,
  ): void => {
    setFirstInternalValue(newFirstValue);
    setSecondInternalValue(newSecondValue);

    onChange?.({
      firstValue: newFirstValue,
      secondValue: newSecondValue,
    });
  };

  const [focusPosition, setFocusPosition] = useState<'left' | 'right'>('left');

  useScopedHotkeys(
    Key.Enter,
    () => {
      onEnter({
        firstValue: firstInternalValue,
        secondValue: secondInternalValue,
      });
    },
    hotkeyScope,
    [onEnter, firstInternalValue, secondInternalValue],
  );

  useScopedHotkeys(
    [Key.Escape],
    () => {
      onEscape({
        firstValue: firstInternalValue,
        secondValue: secondInternalValue,
      });
    },
    hotkeyScope,
    [onEscape, firstInternalValue, secondInternalValue],
  );

  useScopedHotkeys(
    'tab',
    () => {
      if (focusPosition === 'left') {
        setFocusPosition('right');
        secondValueInputRef.current?.focus();
      } else {
        onTab?.({
          firstValue: firstInternalValue,
          secondValue: secondInternalValue,
        });
      }
    },
    hotkeyScope,
    [onTab, firstInternalValue, secondInternalValue, focusPosition],
  );

  useScopedHotkeys(
    'shift+tab',
    () => {
      if (focusPosition === 'right') {
        setFocusPosition('left');
        firstValueInputRef.current?.focus();
      } else {
        onShiftTab?.({
          firstValue: firstInternalValue,
          secondValue: secondInternalValue,
        });
      }
    },
    hotkeyScope,
    [onShiftTab, firstInternalValue, secondInternalValue, focusPosition],
  );

  useListenClickOutside({
    refs: [containerRef],
    callback: (event) => {
      onClickOutside?.(event, {
        firstValue: firstInternalValue,
        secondValue: secondInternalValue,
      });
    },
    enabled: isDefined(onClickOutside),
  });

  const handleOnPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    if (firstInternalValue.length > 0 || secondInternalValue.length > 0) {
      return;
    }

    event.preventDefault();

    const name = event.clipboardData.getData('Text');

    const splittedName = name.split(' ');

    onPaste?.({ firstValue: splittedName[0], secondValue: splittedName[1] });
  };

  return (
    <StyledContainer ref={containerRef}>
      <StyledTextInput
        autoComplete="off"
        autoFocus
        onFocus={() => setFocusPosition('left')}
        ref={firstValueInputRef}
        placeholder={firstValuePlaceholder}
        value={firstInternalValue}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          handleChange(event.target.value, secondInternalValue);
        }}
        onPaste={(event: ClipboardEvent<HTMLInputElement>) =>
          handleOnPaste(event)
        }
      />
      <StyledTextInput
        autoComplete="off"
        onFocus={() => setFocusPosition('right')}
        ref={secondValueInputRef}
        placeholder={secondValuePlaceholder}
        value={secondInternalValue}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          handleChange(firstInternalValue, event.target.value);
        }}
      />
    </StyledContainer>
  );
};
