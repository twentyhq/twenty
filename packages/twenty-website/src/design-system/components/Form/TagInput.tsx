'use client';

import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { useId, useState, type KeyboardEvent } from 'react';

import { filterSkillSuggestions } from './skill-suggestions';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(2)};
`;

const ComboBox = styled.div`
  position: relative;
`;

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

const Menu = styled.ul`
  background: #1a1a1a;
  border: 1px solid ${theme.colors.secondary.border[20]};
  border-radius: ${theme.radius(2)};
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
  left: 0;
  list-style: none;
  margin: ${theme.spacing(1)} 0 0;
  max-height: 220px;
  overflow-y: auto;
  padding: ${theme.spacing(1)};
  position: absolute;
  right: 0;
  top: 100%;
  z-index: 2;
`;

const MenuItem = styled.li`
  border-radius: ${theme.radius(1)};
  color: ${theme.colors.secondary.text[80]};
  cursor: pointer;
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3.5)};
  padding: ${theme.spacing(2)};

  &[data-active='true'] {
    background: rgba(74, 56, 245, 0.18);
    color: ${theme.colors.secondary.text[100]};
  }
`;

const SuggestRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing(1.5)};
`;

const Ghost = styled.button`
  background: transparent;
  border: 1px dashed ${theme.colors.secondary.border[20]};
  border-radius: ${theme.radius(8)};
  color: ${theme.colors.secondary.text[60]};
  cursor: pointer;
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3.25)};
  padding: ${theme.spacing(1)} ${theme.spacing(2)};

  &:hover {
    border-color: ${theme.colors.secondary.border[40]};
    color: ${theme.colors.secondary.text[100]};
  }
`;

type FormTagInputProps = {
  values: ReadonlyArray<string>;
  onValuesChange: (values: string[]) => void;
  placeholder?: string;
  ariaLabel?: string;
  suggestions?: ReadonlyArray<string>;
};

export function FormTagInput({
  values,
  onValuesChange,
  placeholder,
  ariaLabel,
  suggestions,
}: FormTagInputProps) {
  const [draft, setDraft] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const listId = useId();

  const menuMatches =
    suggestions !== undefined
      ? filterSkillSuggestions(suggestions, values, draft)
      : [];
  const menuOpen = menuMatches.length > 0;

  const addValue = (raw: string) => {
    const trimmed = raw.trim();
    if (trimmed === '') return;
    if (!values.some((v) => v.toLowerCase() === trimmed.toLowerCase())) {
      onValuesChange([...values, trimmed]);
    }
    setDraft('');
    setActiveIndex(-1);
  };

  const removeAt = (index: number) => {
    onValuesChange(values.filter((_, i) => i !== index));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (menuOpen && event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % menuMatches.length);
      return;
    }
    if (menuOpen && event.key === 'ArrowUp') {
      event.preventDefault();
      // From no selection (-1) or the first option (0), wrap up to the last one.
      setActiveIndex((i) => (i <= 0 ? menuMatches.length - 1 : i - 1));
      return;
    }
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      if (menuOpen && activeIndex >= 0) addValue(menuMatches[activeIndex]);
      else addValue(draft);
      return;
    }
    if (event.key === 'Escape') {
      setActiveIndex(-1);
      return;
    }
    if (event.key === 'Backspace' && draft === '' && values.length > 0) {
      onValuesChange(values.slice(0, -1));
    }
  };

  const remainingSuggestions =
    suggestions !== undefined
      ? suggestions.filter(
          (s) => !values.some((v) => v.toLowerCase() === s.toLowerCase()),
        )
      : [];

  return (
    <Container>
      <ComboBox>
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
            role={suggestions ? 'combobox' : undefined}
            aria-expanded={suggestions ? menuOpen : undefined}
            aria-controls={suggestions ? listId : undefined}
            autoComplete="off"
            onChange={(event) => {
              setDraft(event.target.value);
              setActiveIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            onBlur={() => addValue(draft)}
          />
        </Wrapper>
        {menuOpen ? (
          <Menu id={listId} role="listbox">
            {menuMatches.map((match, index) => (
              <MenuItem
                key={match}
                role="option"
                aria-selected={index === activeIndex}
                data-active={index === activeIndex ? 'true' : undefined}
                onMouseDown={(event) => {
                  event.preventDefault();
                  addValue(match);
                }}
              >
                {match}
              </MenuItem>
            ))}
          </Menu>
        ) : null}
      </ComboBox>
      {remainingSuggestions.length > 0 ? (
        <SuggestRow>
          {remainingSuggestions.map((suggestion) => (
            <Ghost
              key={suggestion}
              type="button"
              onClick={() => addValue(suggestion)}
            >
              + {suggestion}
            </Ghost>
          ))}
        </SuggestRow>
      ) : null}
    </Container>
  );
}
