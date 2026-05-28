'use client';

import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { useState, type KeyboardEvent } from 'react';

const Wrapper = styled.div`
  align-items: center;
  background: transparent;
  border: 1px solid ${theme.colors.secondary.border[20]};
  border-radius: ${theme.radius(2)};
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing(1.5)};
  min-height: clamp(40px, 5.5vh, 56px);
  padding: ${theme.spacing(1.5)} ${theme.spacing(2)};
  width: 100%;

  &:focus-within {
    border-color: ${theme.colors.highlight[100]};
  }
`;

const Chip = styled.span`
  align-items: center;
  background: rgba(74, 56, 245, 0.18);
  border-radius: ${theme.radius(8)};
  color: ${theme.colors.secondary.text[100]};
  display: inline-flex;
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3.5)};
  gap: ${theme.spacing(1)};
  padding: ${theme.spacing(0.5)} ${theme.spacing(2)};
`;

const ChipRemove = styled.button`
  background: transparent;
  border: none;
  color: ${theme.colors.secondary.text[60]};
  cursor: pointer;
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3.5)};
  line-height: 1;
  padding: 0;

  &:focus-visible {
    outline: 2px solid ${theme.colors.highlight[100]};
    outline-offset: 2px;
  }
`;

const InlineInput = styled.input`
  background: transparent;
  border: none;
  color: ${theme.colors.secondary.text[100]};
  flex: 1 1 120px;
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(4)};
  min-width: 120px;
  outline: none;

  &::placeholder {
    color: ${theme.colors.secondary.text[40]};
  }
`;

type FormTagInputProps = {
  values: ReadonlyArray<string>;
  onValuesChange: (values: string[]) => void;
  placeholder?: string;
  ariaLabel?: string;
};

export function FormTagInput({
  values,
  onValuesChange,
  placeholder,
  ariaLabel,
}: FormTagInputProps) {
  const [draft, setDraft] = useState('');

  const addDraft = () => {
    const trimmed = draft.trim();
    if (trimmed === '') return;
    if (values.includes(trimmed)) {
      setDraft('');
      return;
    }
    onValuesChange([...values, trimmed]);
    setDraft('');
  };

  const removeAt = (index: number) => {
    onValuesChange(values.filter((_, i) => i !== index));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addDraft();
    } else if (event.key === 'Backspace' && draft === '' && values.length > 0) {
      onValuesChange(values.slice(0, -1));
    }
  };

  return (
    <Wrapper>
      {values.map((tag, index) => (
        <Chip key={`${tag}-${index}`}>
          {tag}
          <ChipRemove
            type="button"
            aria-label={`Remove ${tag}`}
            onClick={() => removeAt(index)}
          >
            ×
          </ChipRemove>
        </Chip>
      ))}
      <InlineInput
        type="text"
        value={draft}
        placeholder={values.length === 0 ? placeholder : undefined}
        aria-label={ariaLabel}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addDraft}
      />
    </Wrapper>
  );
}
