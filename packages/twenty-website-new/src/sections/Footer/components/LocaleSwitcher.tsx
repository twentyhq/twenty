'use client';

import { styled } from '@linaria/react';
import { IconCheck, IconChevronDown, IconWorld } from '@tabler/icons-react';
import Link from 'next/link';
import {
  type ChangeEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { type AppLocale } from 'twenty-shared/translations';

import { WEBSITE_LOCALE_LIST } from '@/lib/i18n/utils/app-locale-set';
import { localizeHref } from '@/lib/i18n/utils/localize-href';
import {
  getEnglishLocaleName,
  getNativeLocaleName,
} from '@/lib/i18n/utils/locale-display-names';
import { useLocale } from '@/lib/i18n/hooks/use-locale';
import { useUnlocalizedPathname } from '@/lib/i18n/hooks/use-unlocalized-pathname';
import { LocaleSwitcherDismissEffect } from '@/sections/Footer/effect-components/LocaleSwitcherDismissEffect';
import { theme } from '@/theme';

const SEARCH_THRESHOLD = 6;

type LocaleEntry = {
  locale: AppLocale;
  nativeName: string;
  englishName: string;
};

const ALL_LOCALES: readonly LocaleEntry[] = WEBSITE_LOCALE_LIST.map(
  (locale) => ({
    locale,
    nativeName: getNativeLocaleName(locale),
    englishName: getEnglishLocaleName(locale),
  }),
).sort((a, b) => a.nativeName.localeCompare(b.nativeName));

const matchesQuery = (entry: LocaleEntry, normalisedQuery: string): boolean =>
  entry.nativeName.toLocaleLowerCase().includes(normalisedQuery) ||
  entry.englishName.toLocaleLowerCase().includes(normalisedQuery);

const Wrapper = styled.div`
  position: relative;
`;

const TriggerButton = styled.button`
  align-items: center;
  background: transparent;
  border: 1px solid ${theme.colors.primary.border[40]};
  border-radius: ${theme.radius(1)};
  color: ${theme.colors.primary.text[100]};
  cursor: pointer;
  display: inline-flex;
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.medium};
  gap: ${theme.spacing(2)};
  line-height: 1;
  padding: ${theme.spacing(2)} ${theme.spacing(3)};

  &:hover,
  &[aria-expanded='true'] {
    border-color: ${theme.colors.primary.border[100]};
  }

  &:focus-visible {
    outline: 1px solid ${theme.colors.highlight[100]};
    outline-offset: 1px;
  }
`;

const TriggerLabel = styled.span`
  white-space: nowrap;
`;

const Popup = styled.div`
  background: #0c0c0c;
  border: 1px solid ${theme.colors.secondary.border[20]};
  border-radius: ${theme.radius(2)};
  bottom: calc(100% + ${theme.spacing(2)});
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
  color: ${theme.colors.secondary.text[100]};
  display: flex;
  flex-direction: column;
  left: 0;
  max-width: 320px;
  min-width: 240px;
  overflow: hidden;
  padding: ${theme.spacing(2)};
  position: absolute;
  z-index: ${theme.zIndex.modal};
`;

const SearchInput = styled.input`
  background: ${theme.colors.secondary.text[10]};
  border: 1px solid ${theme.colors.secondary.border[20]};
  border-radius: ${theme.radius(1)};
  color: ${theme.colors.secondary.text[100]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3)};
  margin-bottom: ${theme.spacing(2)};
  padding: ${theme.spacing(2)} ${theme.spacing(3)};
  width: 100%;

  &::placeholder {
    color: ${theme.colors.secondary.text[60]};
  }

  &:focus-visible {
    outline: 1px solid ${theme.colors.highlight[100]};
    outline-offset: 1px;
  }
`;

const ItemList = styled.nav`
  display: flex;
  flex-direction: column;
  max-height: 320px;
  overflow-y: auto;
`;

const ItemLink = styled(Link)`
  align-items: center;
  border-radius: ${theme.radius(1)};
  color: ${theme.colors.secondary.text[100]};
  display: flex;
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3)};
  gap: ${theme.spacing(2)};
  justify-content: space-between;
  padding: ${theme.spacing(2)} ${theme.spacing(3)};
  text-decoration: none;

  &:hover {
    background: ${theme.colors.secondary.text[10]};
  }

  &:focus-visible {
    outline: 1px solid ${theme.colors.highlight[100]};
    outline-offset: 1px;
  }

  &[aria-current='true'] {
    background: ${theme.colors.secondary.text[10]};
    pointer-events: none;
  }
`;

const ItemPrimary = styled.span`
  font-weight: ${theme.font.weight.medium};
`;

const ItemSecondary = styled.span`
  color: ${theme.colors.secondary.text[60]};
  flex: 1;
  font-size: ${theme.font.size(2)};
  margin-left: ${theme.spacing(2)};
  text-align: right;
`;

const Empty = styled.div`
  color: ${theme.colors.secondary.text[60]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3)};
  padding: ${theme.spacing(3)};
  text-align: center;
`;

export function LocaleSwitcher() {
  const currentLocale = useLocale();
  const unlocalizedPathname = useUnlocalizedPathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filteredItems = useMemo(() => {
    const trimmed = query.trim().toLocaleLowerCase();
    if (trimmed.length === 0) return ALL_LOCALES;
    return ALL_LOCALES.filter((entry) => matchesQuery(entry, trimmed));
  }, [query]);

  const handleDismiss = useCallback(() => {
    setOpen(false);
  }, []);

  if (ALL_LOCALES.length < 2) return null;

  const triggerLabel = getNativeLocaleName(currentLocale);
  const showSearch = ALL_LOCALES.length > SEARCH_THRESHOLD;

  const handleToggle = () => {
    setOpen((prev) => {
      if (prev) setQuery('');
      return !prev;
    });
  };

  const handleSelect = () => {
    setOpen(false);
    setQuery('');
  };

  const handleQueryChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  return (
    <Wrapper ref={wrapperRef}>
      <LocaleSwitcherDismissEffect
        open={open}
        onDismiss={handleDismiss}
        wrapperRef={wrapperRef}
        triggerRef={triggerRef}
        searchRef={searchRef}
        showSearch={showSearch}
      />
      <TriggerButton
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Change language"
        onClick={handleToggle}
      >
        <IconWorld size={14} aria-hidden />
        <TriggerLabel>{triggerLabel}</TriggerLabel>
        <IconChevronDown size={12} aria-hidden />
      </TriggerButton>
      {open && (
        <Popup role="dialog" aria-label="Choose a language">
          {showSearch && (
            <SearchInput
              ref={searchRef}
              type="search"
              placeholder="Search language…"
              aria-label="Search languages"
              value={query}
              onChange={handleQueryChange}
            />
          )}
          <ItemList aria-label="Available languages">
            {filteredItems.map(({ locale, nativeName, englishName }) => {
              const isActive = locale === currentLocale;
              return (
                <ItemLink
                  key={locale}
                  href={localizeHref(locale, unlocalizedPathname)}
                  hrefLang={locale}
                  lang={locale}
                  prefetch={false}
                  aria-current={isActive ? 'true' : undefined}
                  onClick={handleSelect}
                >
                  <ItemPrimary>{nativeName}</ItemPrimary>
                  {englishName !== nativeName && (
                    <ItemSecondary>{englishName}</ItemSecondary>
                  )}
                  {isActive && <IconCheck size={14} aria-hidden />}
                </ItemLink>
              );
            })}
            {filteredItems.length === 0 && <Empty>No matches</Empty>}
          </ItemList>
        </Popup>
      )}
    </Wrapper>
  );
}
