'use client';

import { styled } from '@linaria/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';

import { TwentyLogo } from '@/icons';
import {
  DURATION,
  EASING,
  FONT_WEIGHT,
  MAX_CONTENT_WIDTH_PX,
  REDUCED_MOTION,
  Z_INDEX,
  buildSchemeContext,
  fontFamily,
  fontSize,
  mediaUp,
  radius,
  semanticColor,
  spacing,
} from '@/tokens';

import { LocalizedLink } from '@/platform/i18n/LocalizedLink';
import { useUnlocalizedPathname } from '@/platform/i18n/use-unlocalized-pathname';

import { DESIGN_SYSTEM_CHROME } from './design-system-chrome';
import { DESIGN_SYSTEM_NAV, type NavGroup } from './design-system-nav';
import { DESIGN_SYSTEM_TABS } from './design-system-tabs';

const { headerHeight: HEADER_HEIGHT, chromeHeight: CHROME_HEIGHT } =
  DESIGN_SYSTEM_CHROME;

// The doc reads in the site's dark scheme; previews keep their own scheme.
const Page = styled.div`
  ${buildSchemeContext('dark')}
  color-scheme: dark;
  // Full-width previews reach the window's edges, never past them.
  overflow-x: clip;
  background: ${semanticColor.surface};
  color: ${semanticColor.ink};
  min-height: 100vh;
`;

// One bar like Arc: brand, the level tabs, then the shortcut on the right.
const Header = styled.header`
  background: ${semanticColor.surface};
  border-bottom: 1px solid ${semanticColor.line};
  position: sticky;
  top: 0;
  z-index: ${Z_INDEX.stickyHeader};
`;

const HeaderInner = styled.div`
  align-items: stretch;
  display: flex;
  gap: ${spacing(8)};
  height: ${HEADER_HEIGHT};
  margin-inline: auto;
  max-width: ${MAX_CONTENT_WIDTH_PX}px;
  padding-inline: ${spacing(4)};

  ${mediaUp('md')} {
    padding-inline: ${spacing(6)};
  }
`;

const Brand = styled(LocalizedLink)`
  align-items: center;
  align-self: center;
  color: ${semanticColor.ink};
  display: flex;
  gap: ${spacing(2.5)};
  flex-shrink: 0;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  text-decoration: none;

  & > span {
    color: ${semanticColor.inkMuted};
  }
`;

const Shell = styled.div`
  display: grid;
  gap: ${spacing(10)};
  margin-inline: auto;
  max-width: ${MAX_CONTENT_WIDTH_PX}px;
  padding-inline: ${spacing(4)};

  ${mediaUp('md')} {
    grid-template-columns: ${spacing(60)} minmax(0, 1fr);
    padding-inline: ${spacing(6)};
  }
`;

const Sidebar = styled.nav`
  display: none;

  ${mediaUp('md')} {
    align-self: start;
    display: block;
    max-height: calc(100vh - ${CHROME_HEIGHT});
    border-right: 1px solid ${semanticColor.line};
    min-height: calc(100vh - ${CHROME_HEIGHT});
    overflow-y: auto;
    padding: ${spacing(6)} ${spacing(4)} ${spacing(6)} 0;
    position: sticky;
    top: ${CHROME_HEIGHT};
  }
`;

const MobileNav = styled.details`
  border-bottom: 1px solid ${semanticColor.line};
  padding-block: ${spacing(3)};

  & > summary {
    cursor: pointer;
    font-family: ${fontFamily('sans')};
    font-size: ${fontSize(3.5)};
  }

  ${mediaUp('md')} {
    display: none;
  }
`;

const Tree = styled.ul`
  list-style: none;

  & ul {
    list-style: none;
    padding-left: ${spacing(4)};
  }
`;

// One row of the tree: a group toggle or a page link, both aligned on the
// chevron column so labels line up at every level.
const Row = styled.button`
  align-items: center;
  background: none;
  border: none;
  border-radius: ${radius(2)};
  color: ${semanticColor.inkMuted};
  cursor: pointer;
  display: flex;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  gap: ${spacing(1)};
  padding: ${spacing(1)} ${spacing(2)} ${spacing(1)} 0;
  text-align: left;
  width: 100%;

  &:hover,
  &[data-in-branch] {
    color: ${semanticColor.ink};
  }

  &:focus-visible {
    outline: 1px solid ${semanticColor.lineStrong};
  }

  & > span {
    color: ${semanticColor.inkSubtle};
    font-family: ${fontFamily('mono')};
    font-size: ${fontSize(3)};
    margin-left: auto;
  }

  & svg {
    flex-shrink: 0;
    transition: transform ${DURATION.sm} ${EASING.standard};
  }

  &[aria-expanded='true'] svg {
    transform: rotate(90deg);
  }

  ${REDUCED_MOTION} {
    & svg {
      transition: none;
    }
  }
`;

const Link = styled(LocalizedLink)`
  border-radius: ${radius(2)};
  color: ${semanticColor.inkMuted};
  display: block;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  padding: ${spacing(1)} ${spacing(2)} ${spacing(1)} ${spacing(4)};
  text-decoration: none;

  &:hover {
    color: ${semanticColor.ink};
  }

  &[aria-current='page'] {
    background: ${semanticColor.line};
    color: ${semanticColor.ink};
    font-weight: ${FONT_WEIGHT.medium};
  }
`;

const Empty = styled.p`
  color: ${semanticColor.inkSubtle};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  padding-inline: ${spacing(2)};
`;

const Filter = styled.input`
  background: transparent;
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  height: ${spacing(8)};
  margin-bottom: ${spacing(4)};
  padding-inline: ${spacing(3)};
  width: 100%;

  &::placeholder {
    color: ${semanticColor.inkSubtle};
  }

  &:focus-visible {
    border-color: ${semanticColor.lineStrong};
    outline: none;
  }
`;

const Chevron = () => (
  <svg aria-hidden="true" height="16" viewBox="0 0 16 16" width="16">
    <path d="M6 4l4 4-4 4" fill="none" stroke="currentColor" />
  </svg>
);

const countPages = (group: NavGroup): number =>
  group.items.length +
  (group.subgroups ?? []).reduce(
    (total, subgroup) => total + countPages(subgroup),
    0,
  );

const containsPage = (group: NavGroup, href?: string): boolean =>
  group.items.some((item) => item.href === href) ||
  (group.subgroups ?? []).some((subgroup) => containsPage(subgroup, href));

// Like Apple's HIG sidebar: one tree, the branch of the current page open,
// every branch open while filtering.
function NavTree({
  nav,
  current,
  query,
}: {
  nav: NavGroup[];
  current?: string;
  query: string;
}) {
  const [toggled, setToggled] = useState<Record<string, boolean>>({});
  const needle = query.trim().toLowerCase();
  const filterGroup = (group: NavGroup): NavGroup => ({
    title: group.title,
    items: group.items.filter((item) =>
      item.label.toLowerCase().includes(needle),
    ),
    subgroups: group.subgroups
      ?.map(filterGroup)
      .filter((subgroup) => subgroup.items.length > 0),
  });
  const groups = nav
    .map(filterGroup)
    .filter((group) => group.items.length > 0 || group.subgroups?.length);

  if (groups.length === 0) return <Empty>No match.</Empty>;

  const renderGroup = (group: NavGroup, path: string) => {
    const key = `${path}/${group.title}`;
    const inBranch = containsPage(group, current);
    const open = needle.length > 0 || (toggled[key] ?? inBranch);
    return (
      <li key={key}>
        <Row
          aria-expanded={open}
          data-in-branch={inBranch || undefined}
          type="button"
          onClick={() => setToggled({ ...toggled, [key]: !open })}
        >
          <Chevron />
          {group.title}
          <span>{countPages(group)}</span>
        </Row>
        {open ? (
          <ul>
            {group.items.map((item) => (
              <li key={item.href}>
                <Link
                  aria-current={item.href === current ? 'page' : undefined}
                  href={item.href}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {(group.subgroups ?? []).map((subgroup) =>
              renderGroup(subgroup, key),
            )}
          </ul>
        ) : null}
      </li>
    );
  };

  return <Tree>{groups.map((group) => renderGroup(group, ''))}</Tree>;
}

const Tabs = styled.nav`
  display: flex;
  gap: ${spacing(6)};
  overflow-x: auto;
  scrollbar-width: none;

  & a {
    align-items: center;
    border-bottom: ${spacing(0.5)} solid transparent;
    color: ${semanticColor.inkMuted};
    display: flex;
    flex-shrink: 0;
    font-family: ${fontFamily('sans')};
    font-size: ${fontSize(3.5)};
    font-weight: ${FONT_WEIGHT.medium};
    margin-bottom: -1px;
    text-decoration: none;
  }

  & a:hover {
    color: ${semanticColor.ink};
  }

  & a[aria-current='page'] {
    border-bottom-color: ${semanticColor.ink};
    color: ${semanticColor.ink};
  }
`;

const Shortcut = styled.kbd`
  align-self: center;
  margin-left: auto;
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(1)};
  color: ${semanticColor.inkSubtle};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  padding: 0 ${spacing(1.5)};
`;

// The persistent frame of /design-system, mounted once by the route's
// layout: moving between pages swaps only the content, the sidebar stays put.
export function DesignSystemShell({ children }: { children: ReactNode }) {
  const current = useUnlocalizedPathname();
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const tab = DESIGN_SYSTEM_NAV.tabOf(current);
  const nav = DESIGN_SYSTEM_NAV.byTab[tab];

  // The global shortcut is a document listener, so it lives in an effect.
  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener('keydown', focusSearch);
    return () => document.removeEventListener('keydown', focusSearch);
  }, []);

  return (
    <Page>
      <Header>
        <HeaderInner>
          <Brand href="/design-system">
            <TwentyLogo sizePx={28} />
            <span>Design system</span>
          </Brand>
          <Tabs aria-label="Design system levels">
            {DESIGN_SYSTEM_TABS.map((entry) => (
              <LocalizedLink
                key={entry.id}
                aria-current={entry.id === tab ? 'page' : undefined}
                href={entry.href}
              >
                {entry.label}
              </LocalizedLink>
            ))}
          </Tabs>
          <Shortcut>⌘K to filter</Shortcut>
        </HeaderInner>
      </Header>
      <Shell>
        <MobileNav open={query.length > 0}>
          <summary>Menu</summary>
          <NavTree current={current} nav={nav} query={query} />
        </MobileNav>
        <Sidebar aria-label="Design system">
          <Filter
            ref={searchRef}
            aria-label="Filter the menu"
            placeholder="Filter"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <NavTree current={current} nav={nav} query={query} />
        </Sidebar>
        {children}
      </Shell>
    </Page>
  );
}
