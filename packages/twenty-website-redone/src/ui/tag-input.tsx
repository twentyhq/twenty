'use client';

import { styled } from '@linaria/react';
import { useState } from 'react';

import {
  color,
  fontFamily,
  radius,
  semanticColor,
  spacing,
  typeRampDeclarations,
} from '@/tokens';

import { addTag } from './add-tag';
import { chipClassName } from './chip-style';

const TagBox = styled.div`
  align-items: center;
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(1.5)};
  padding: ${spacing(2)};

  &:focus-within {
    border-color: ${color('blue')};
  }
`;

const AddedChip = styled.span`
  ${typeRampDeclarations('bodySm')}
  align-items: center;
  background: ${color('blue')};
  border-radius: ${radius(2)};
  color: ${color('white')};
  column-gap: ${spacing(1)};
  display: inline-flex;
  font-family: ${fontFamily('sans')};
  padding: ${spacing(0.5)} ${spacing(2)};
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font: inherit;
  line-height: 1;
  padding: 0;
`;

const TagInputControl = styled.input`
  ${typeRampDeclarations('bodySm')}
  background: none;
  border: none;
  color: ${semanticColor.ink};
  flex: 1 0 80px;
  font-family: ${fontFamily('sans')};
  min-width: 80px;

  &::placeholder {
    color: ${semanticColor.inkMuted};
  }

  &:focus {
    outline: none;
  }
`;

const SuggestionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(2)};
  margin-top: ${spacing(2)};
`;

// A free-text tag entry with suggestions: Enter or comma adds the draft, a
// suggestion click adds it, Backspace on an empty draft removes the last tag.
// Stays i18n-free — the consumer supplies a localized removeLabel(tag).
export function TagInput({
  ariaLabel,
  onValuesChange,
  placeholder,
  removeLabel,
  suggestions,
  values,
}: {
  ariaLabel: string;
  onValuesChange: (values: string[]) => void;
  placeholder?: string;
  removeLabel: (tag: string) => string;
  suggestions: readonly string[];
  values: readonly string[];
}) {
  const [draft, setDraft] = useState('');

  const commit = (raw: string) => {
    const next = addTag(values, raw);
    if (next.length !== values.length) onValuesChange(next);
    setDraft('');
  };
  const remove = (tag: string) =>
    onValuesChange(values.filter((value) => value !== tag));

  const available = suggestions.filter((tag) => !values.includes(tag));

  return (
    <div>
      <TagBox>
        {values.map((tag) => (
          <AddedChip key={tag}>
            {tag}
            <RemoveButton
              aria-label={removeLabel(tag)}
              onClick={() => remove(tag)}
              type="button"
            >
              ×
            </RemoveButton>
          </AddedChip>
        ))}
        <TagInputControl
          aria-label={ariaLabel}
          autoComplete="off"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ',') {
              event.preventDefault();
              commit(draft);
            } else if (
              event.key === 'Backspace' &&
              draft === '' &&
              values.length > 0
            ) {
              remove(values[values.length - 1]);
            }
          }}
          placeholder={values.length === 0 ? placeholder : undefined}
          value={draft}
        />
      </TagBox>
      {available.length > 0 ? (
        <SuggestionRow>
          {available.map((tag) => (
            <button
              className={chipClassName}
              key={tag}
              onClick={() => commit(tag)}
              type="button"
            >
              {tag}
            </button>
          ))}
        </SuggestionRow>
      ) : null}
    </div>
  );
}
