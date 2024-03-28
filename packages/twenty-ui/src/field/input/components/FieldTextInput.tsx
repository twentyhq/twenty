import { ChangeEvent, useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';

import { useRegisterInputEvents } from 'src/field/hooks/useRegisterInputEvents';
import { TEXT_INPUT_STYLE } from 'src/theme';

export const StyledTextInput = styled.input`
  margin: 0;
  ${TEXT_INPUT_STYLE}
  width: 100%;
`;

type FieldTextInputProps = {
  placeholder?: string;
  autoFocus?: boolean;
  value: string;
  onEnter: (newText: string) => void;
  onEscape: (newText: string) => void;
  onTab?: (newText: string) => void;
  onShiftTab?: (newText: string) => void;
  onClickOutside: (event: MouseEvent | TouchEvent, inputValue: string) => void;
  hotkeyScope: string;
  onChange?: (newText: string) => void;
};

export const FieldTextInput = ({
  placeholder,
  autoFocus,
  value,
  hotkeyScope,
  onEnter,
  onEscape,
  onTab,
  onShiftTab,
  onClickOutside,
  onChange,
}: FieldTextInputProps) => {
  const [internalText, setInternalText] = useState(value);

  const wrapperRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInternalText(event.target.value);
    onChange?.(event.target.value);
  };

  useEffect(() => {
    setInternalText(value);
  }, [value]);

  useRegisterInputEvents({
    inputRef: wrapperRef,
    inputValue: internalText,
    onEnter,
    onEscape,
    onClickOutside,
    onTab,
    onShiftTab,
    hotkeyScope,
  });

  return (
    <StyledTextInput
      autoComplete="off"
      ref={wrapperRef}
      placeholder={placeholder}
      onChange={handleChange}
      autoFocus={autoFocus}
      value={internalText}
    />
  );
};
