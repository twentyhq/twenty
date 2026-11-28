'use client';

import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { LocalizedLink } from '@/platform/i18n/LocalizedLink';
import { useUnlocalizedPathname } from '@/platform/i18n/use-unlocalized-pathname';
import {
  fontFamily,
  fontSize,
  mediaUp,
  radius,
  semanticColor,
  spacing,
} from '@/tokens';

import { DESIGN_SYSTEM_CHROME } from './design-system-chrome';
import { DESIGN_SYSTEM_NAV } from './design-system-nav';

export type TocEntry = { id: string; label: string };

const Columns = styled.div`
  display: grid;
  gap: ${spacing(10)};
  min-width: 0;

  ${mediaUp('lg')} {
    grid-template-columns: minmax(0, 1fr) ${spacing(48)};
  }
`;

const Main = styled.main`
  min-width: 0;
  padding-block: ${spacing(10)};
`;

const Toc = styled.nav`
  display: none;

  ${mediaUp('lg')} {
    align-self: start;
    display: block;
    padding-block: ${spacing(10)};
    position: sticky;
    top: ${DESIGN_SYSTEM_CHROME.chromeHeight};
  }
`;

const TocTitle = styled.p`
  color: ${semanticColor.inkSubtle};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  padding-inline: ${spacing(2)};
  text-transform: uppercase;
`;

const TocList = styled.ul`
  list-style: none;
  margin-top: ${spacing(2)};

  & a {
    border-radius: ${radius(2)};
    color: ${semanticColor.inkMuted};
    display: block;
    font-family: ${fontFamily('sans')};
    font-size: ${fontSize(3.5)};
    padding: ${spacing(1)} ${spacing(2)};
    text-decoration: none;
  }

  & a:hover {
    color: ${semanticColor.ink};
  }
`;

const Pager = styled.nav`
  border-top: 1px solid ${semanticColor.line};
  display: grid;
  gap: ${spacing(3)};
  grid-template-columns: 1fr 1fr;
  margin-top: ${spacing(12)};
  padding-top: ${spacing(6)};

  & a {
    border: 1px solid ${semanticColor.line};
    border-radius: ${radius(2)};
    color: ${semanticColor.ink};
    display: block;
    font-family: ${fontFamily('sans')};
    font-size: ${fontSize(3.5)};
    padding: ${spacing(3)} ${spacing(4)};
    text-decoration: none;
  }

  & a:hover {
    border-color: ${semanticColor.lineStrong};
  }

  & a > span {
    color: ${semanticColor.inkSubtle};
    display: block;
    font-size: ${fontSize(3)};
  }

  & a[rel='next'] {
    grid-column: 2;
    text-align: right;
  }
`;
// One page of the doc inside the persistent frame: its content, its table of
// contents, and the previous and next pages of its tab.
export function DocPage({
  toc,
  children,
}: {
  toc?: TocEntry[];
  children: ReactNode;
}) {
  const current = useUnlocalizedPathname();
  const order = DESIGN_SYSTEM_NAV.pageOrder[DESIGN_SYSTEM_NAV.tabOf(current)];
  const position = order.findIndex((page) => page.href === current);
  const previous = position > 0 ? order[position - 1] : undefined;
  const next =
    position >= 0 && position < order.length - 1
      ? order[position + 1]
      : undefined;

  return (
    <Columns>
      <Main>
        {children}
        {previous || next ? (
          <Pager aria-label="Previous and next pages">
            {previous ? (
              <LocalizedLink href={previous.href} rel="prev">
                <span>Previous</span>
                {previous.label}
              </LocalizedLink>
            ) : null}
            {next ? (
              <LocalizedLink href={next.href} rel="next">
                <span>Next</span>
                {next.label}
              </LocalizedLink>
            ) : null}
          </Pager>
        ) : null}
      </Main>
      {toc?.length ? (
        <Toc aria-label="On this page">
          <TocTitle>On this page</TocTitle>
          <TocList>
            {toc.map((entry) => (
              <li key={entry.id}>
                <a href={`#${entry.id}`}>{entry.label}</a>
              </li>
            ))}
          </TocList>
        </Toc>
      ) : null}
    </Columns>
  );
}
