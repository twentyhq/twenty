'use client';

import { IconCheck, IconChevronDown, IconWorld } from '@tabler/icons-react';
import { styled } from '@linaria/react';
import Link from 'next/link';
import { useRef, useState } from 'react';

import { localeDisplayName } from '@/platform/i18n/locale-display-name';
import { localizeHref } from '@/platform/i18n/localize-href';
import { useLocale } from '@/platform/i18n/use-locale';
import { useUnlocalizedPathname } from '@/platform/i18n/use-unlocalized-pathname';
import { WEBSITE_LOCALE_LIST } from '@/platform/i18n/website-locale-list';
import {
  SHADOW,
  color,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  radius,
  semanticColor,
  spacing,
  Z_INDEX,
} from '@/tokens';

import { LocaleSwitcherDismissEffect } from './locale-switcher-dismiss-effect';

const Wrapper = styled.div`
  position: relative;
`;

const TriggerButton = styled.button`
  align-items: center;
  background: transparent;
  border: 1px solid ${semanticColor.lineStrong};
  border-radius: ${radius(1)};
  color: ${semanticColor.ink};
  cursor: pointer;
  display: inline-flex;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3)};
  font-weight: ${FONT_WEIGHT.medium};
  gap: ${spacing(2)};
  line-height: 1;
  padding: ${spacing(2)} ${spacing(3)};

  &:hover,
  &[aria-expanded='true'] {
    border-color: ${semanticColor.ink};
  }

  &:focus-visible {
    outline: 1px solid ${color('blue')};
    outline-offset: 1px;
  }
`;

const Popup = styled.div`
  background: ${color('black')};
  border: 1px solid ${color('white-20')};
  border-radius: ${radius(2)};
  bottom: calc(100% + ${spacing(2)});
  box-shadow: ${SHADOW.popupDark};
  color: ${color('white')};
  display: flex;
  flex-direction: column;
  left: 0;
  min-width: 240px;
  overflow: hidden;
  padding: ${spacing(2)};
  position: absolute;
  z-index: ${Z_INDEX.modal};
`;

const ItemLink = styled(Link)`
  align-items: center;
  border-radius: ${radius(1)};
  color: ${color('white')};
  display: flex;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3)};
  gap: ${spacing(2)};
  justify-content: space-between;
  padding: ${spacing(2)} ${spacing(3)};
  text-decoration: none;

  &:hover {
    background: ${color('white-10')};
  }

  &:focus-visible {
    outline: 1px solid ${color('blue')};
    outline-offset: 1px;
  }

  &[aria-current='true'] {
    background: ${color('white-10')};
    pointer-events: none;
  }
`;

const ItemSecondary = styled.span`
  color: ${color('white-60')};
  flex: 1;
  font-size: ${fontSize(2.5)};
  margin-left: ${spacing(2)};
  text-align: right;
`;

export function LocaleSwitcher() {
  const currentLocale = useLocale();
  const unlocalizedPathname = useUnlocalizedPathname();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  if (WEBSITE_LOCALE_LIST.length < 2) return null;

  return (
    <Wrapper ref={wrapperRef}>
      <LocaleSwitcherDismissEffect
        onDismiss={() => setOpen(false)}
        open={open}
        triggerRef={triggerRef}
        wrapperRef={wrapperRef}
      />
      <TriggerButton
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Change language"
        onClick={() => setOpen((previous) => !previous)}
        ref={triggerRef}
        type="button"
      >
        <IconWorld aria-hidden size={14} stroke={1.6} />
        {localeDisplayName.native(currentLocale)}
        <IconChevronDown aria-hidden size={12} stroke={1.6} />
      </TriggerButton>
      {open && (
        <Popup aria-label="Choose a language" role="dialog">
          {WEBSITE_LOCALE_LIST.map((locale) => {
            const nativeName = localeDisplayName.native(locale);
            const englishName = localeDisplayName.english(locale);
            const isActive = locale === currentLocale;
            return (
              <ItemLink
                aria-current={isActive ? 'true' : undefined}
                href={localizeHref(locale, unlocalizedPathname)}
                hrefLang={locale}
                key={locale}
                lang={locale}
                onClick={() => setOpen(false)}
                prefetch={false}
              >
                <span>{nativeName}</span>
                {englishName !== nativeName && (
                  <ItemSecondary>{englishName}</ItemSecondary>
                )}
                {isActive && <IconCheck aria-hidden size={14} stroke={1.6} />}
              </ItemLink>
            );
          })}
        </Popup>
      )}
    </Wrapper>
  );
}
