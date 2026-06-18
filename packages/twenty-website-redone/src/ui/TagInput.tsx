'use client';

import { styled } from '@linaria/react';
import { type KeyboardEvent, useId, useState } from 'react';

import {
  color,
  fontFamily,
  fontSize,
  radius,
  semanticColor,
  SHADOW,
  spacing,
  Z_INDEX,
} from '@/tokens';

import { addTag } from './add-tag';

const Container = styled.div`
  display: flex;
  flex-direction: column;

  & > * + * {
    margin-top: ${spacing(2)};
  }
`;

const ComboBox = styled.div`
  position: relative;
`;

const TagBox = styled.div`
  align-items: center;
  border: 1px solid ${semanticColor.lineStrong};
  border-radius: ${radius(2)};
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(1.5)};
  min-height: clamp(40px, 5.5vh, 56px);
  padding: ${spacing(1.5)} ${spacing(2)};
  width: 100%;

  &:focus-within {
    border-color: ${color('blue')};
  }
`;

const AddedChip = styled.span`
  align-items: center;
  background: ${color('blue-20')};
  border-radius: ${radius(8)};
  color: ${semanticColor.ink};
  column-gap: ${spacing(1)};
  display: inline-flex;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  padding: ${spacing(0.5)} ${spacing(2)};
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: ${semanticColor.inkMuted};
  cursor: pointer;
  font: inherit;
  line-height: 1;
  padding: 0;
`;

const TagInputControl = styled.input`
  background: none;
  border: none;
  color: ${semanticColor.ink};
  flex: 1 1 120px;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
  min-width: 120px;

  &::placeholder {
    color: ${semanticColor.inkSubtle};
  }

  &:focus {
    outline: none;
  }
`;

const Menu = styled.ul`
  background: ${semanticColor.surface};
  border: 1px solid ${semanticColor.lineStrong};
  border-radius: ${radius(2)};
  box-shadow: ${SHADOW.popupDark};
  left: 0;
  list-style: none;
  margin: ${spacing(1)} 0 0;
  max-height: 220px;
  overflow-y: auto;
  padding: ${spacing(1)};
  position: absolute;
  right: 0;
  top: 100%;
  z-index: ${Z_INDEX.portal};
`;

const MenuItem = styled.li`
  border-radius: ${radius(1)};
  color: ${semanticColor.ink};
  cursor: pointer;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
  padding: ${spacing(2)};

  &[data-active] {
    background: ${color('blue-20')};
  }
`;

const SuggestRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(1.5)};
`;

const Ghost = styled.button`
  background: none;
  border: 1px dashed ${semanticColor.lineStrong};
  border-radius: ${radius(8)};
  color: ${semanticColor.inkMuted};
  cursor: pointer;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3)};
  padding: ${spacing(1)} ${spacing(2)};

  &:hover {
    border-color: ${semanticColor.divider};
    color: ${semanticColor.ink};
  }
`;

// Suggestions matching the typed draft (case-insensitive substring), excluding
// the ones already added. Empty draft → no menu.
function matchingSuggestions(
  pool: readonly string[],
  selected: readonly string[],
  query: string,
): string[] {
  const trimmed = query.trim().toLowerCase();
  if (trimmed === '') return [];
  const taken = new Set(selected.map((value) => value.toLowerCase()));
  return pool.filter(
    (value) =>
      !taken.has(value.toLowerCase()) && value.toLowerCase().includes(trimmed),
  );
}

// A free-text tag entry with suggestions: type to filter the dropdown menu,
// Enter/comma adds the draft (or the highlighted match), Backspace on an empty
// draft removes the last tag, and the remaining suggestions show as quick-add
// ghost chips. Stays i18n-free — the consumer supplies a localized removeLabel.
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
  const [activeIndex, setActiveIndex] = useState(-1);
  const listId = useId();

  const menuMatches = matchingSuggestions(suggestions, values, draft);
  const menuOpen = menuMatches.length > 0;

  const commit = (raw: string) => {
    const next = addTag(values, raw);
    if (next.length !== values.length) onValuesChange(next);
    setDraft('');
    setActiveIndex(-1);
  };
  const remove = (tag: string) =>
    onValuesChange(values.filter((value) => value !== tag));

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (menuOpen && event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % menuMatches.length);
      return;
    }
    if (menuOpen && event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) =>
        index <= 0 ? menuMatches.length - 1 : index - 1,
      );
      return;
    }
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      commit(menuOpen && activeIndex >= 0 ? menuMatches[activeIndex] : draft);
      return;
    }
    if (event.key === 'Escape') {
      setActiveIndex(-1);
      return;
    }
    if (event.key === 'Backspace' && draft === '' && values.length > 0) {
      remove(values[values.length - 1]);
    }
  };

  const available = suggestions.filter((tag) => !values.includes(tag));

  return (
    <Container>
      <ComboBox>
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
            aria-controls={listId}
            aria-expanded={menuOpen}
            aria-label={ariaLabel}
            autoComplete="off"
            onBlur={() => commit(draft)}
            onChange={(event) => {
              setDraft(event.target.value);
              setActiveIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            placeholder={values.length === 0 ? placeholder : undefined}
            role="combobox"
            value={draft}
          />
        </TagBox>
        {menuOpen ? (
          <Menu id={listId} role="listbox">
            {menuMatches.map((match, index) => (
              <MenuItem
                aria-selected={index === activeIndex}
                data-active={index === activeIndex ? '' : undefined}
                key={match}
                onMouseDown={(event) => {
                  event.preventDefault();
                  commit(match);
                }}
                role="option"
              >
                {match}
              </MenuItem>
            ))}
          </Menu>
        ) : null}
      </ComboBox>
      {available.length > 0 ? (
        <SuggestRow>
          {available.map((tag) => (
            <Ghost key={tag} onClick={() => commit(tag)} type="button">
              + {tag}
            </Ghost>
          ))}
        </SuggestRow>
      ) : null}
    </Container>
  );
}
