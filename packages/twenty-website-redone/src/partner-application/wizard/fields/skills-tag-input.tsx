'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
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

import { addSkill } from './add-skill';
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

export function SkillsTagInput({
  ariaLabel,
  onValuesChange,
  placeholder,
  suggestions,
  values,
}: {
  ariaLabel: string;
  onValuesChange: (values: string[]) => void;
  placeholder?: string;
  suggestions: readonly string[];
  values: readonly string[];
}) {
  const { i18n } = useLingui();
  const [draft, setDraft] = useState('');

  const commit = (raw: string) => {
    const next = addSkill(values, raw);
    if (next.length !== values.length) onValuesChange(next);
    setDraft('');
  };
  const remove = (skill: string) =>
    onValuesChange(values.filter((value) => value !== skill));

  const available = suggestions.filter((skill) => !values.includes(skill));

  return (
    <div>
      <TagBox>
        {values.map((skill) => (
          <AddedChip key={skill}>
            {skill}
            <RemoveButton
              aria-label={i18n._(msg`Remove ${skill}`)}
              onClick={() => remove(skill)}
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
          {available.map((skill) => (
            <button
              className={chipClassName}
              key={skill}
              onClick={() => commit(skill)}
              type="button"
            >
              {skill}
            </button>
          ))}
        </SuggestionRow>
      ) : null}
    </div>
  );
}
