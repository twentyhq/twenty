'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { type MouseEvent, useEffect, useMemo, useRef, useState } from 'react';

import {
  color,
  DURATION,
  EASING,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  mediaUp,
  MENU_HEIGHT_PX,
  radius,
  REDUCED_MOTION,
  semanticColor,
  spacing,
} from '@/tokens';
import { Body, Heading, SectionShell } from '@/ui';

import { AppsStageCraftCell } from './AppsStageCraftCell';
import { APPS_STAGE_BETA_APP_NAMES } from './apps-stage-beta-apps';
import { APPS_STAGE_CRAFT_COLUMN } from './apps-stage-craft-column';
import { getAppsStagePastel } from './apps-stage-pastels';
import { type MarketplaceApp } from './marketplace-app';
import { useAppsStageLogoInks } from './use-apps-stage-logo-inks';

// PROTOTYPE (?direction=e): the catalogue framed in the page column, after
// Profound's integrations page: every category is its own block on the page,
// the index on the left stays put, follows the scroll and jumps on click.
const Frame = styled.div`
  border-inline: 1px solid ${semanticColor.line};
  display: flex;
  flex-direction: column;
  ${APPS_STAGE_CRAFT_COLUMN}

  ${mediaUp('md')} {
    flex-direction: row;
  }
`;

const Sidebar = styled.div`
  border-bottom: 1px solid ${semanticColor.line};
  padding: ${spacing(8)} ${spacing(4)} ${spacing(6)};

  ${mediaUp('md')} {
    border-bottom: none;
    border-right: 1px solid ${semanticColor.line};
    flex-shrink: 0;
    padding: ${spacing(14)} ${spacing(6)};
    width: 256px;
  }
`;

const SidebarInner = styled.div`
  ${mediaUp('md')} {
    position: sticky;
    top: ${MENU_HEIGHT_PX + 32}px;
  }
`;

const SidebarLabel = styled.p`
  color: ${semanticColor.inkSubtle};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(2.75)};
  letter-spacing: 0.08em;
  line-height: 14px;
  padding-bottom: ${spacing(3)};
  text-transform: uppercase;
`;

const Index = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(1)};

  ${mediaUp('md')} {
    flex-direction: column;
    flex-wrap: nowrap;
  }
`;

const IndexItem = styled.a`
  align-items: center;
  border-radius: ${radius(2)};
  color: ${color('white-60')};
  display: flex;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  gap: ${spacing(3)};
  justify-content: space-between;
  line-height: 18px;
  padding: ${spacing(2)} ${spacing(3)};
  text-align: start;
  text-decoration: none;
  transition:
    background-color ${DURATION.xxs} ${EASING.gentle},
    color ${DURATION.xxs} ${EASING.gentle};

  &:hover {
    color: ${semanticColor.ink};
  }

  &[aria-current='true'] {
    background-color: ${color('white-5')};
    color: ${semanticColor.ink};
  }

  &:focus-visible {
    outline: 1px solid ${color('blue')};
    outline-offset: 1px;
  }

  ${REDUCED_MOTION} {
    transition: none;
  }
`;

const IndexName = styled.span`
  align-items: center;
  display: flex;
  gap: ${spacing(2)};
`;

const PastelDot = styled.span`
  background-color: var(--apps-stage-pastel);
  border-radius: ${radius(0.5)};
  flex-shrink: 0;
  height: 6px;
  width: 6px;
`;

const IndexCount = styled.span`
  color: ${semanticColor.inkSubtle};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  font-variant-numeric: tabular-nums;
  line-height: 16px;

  ${IndexItem}[aria-current='true'] & {
    color: ${semanticColor.inkMuted};
  }
`;

const Main = styled.div`
  flex: 1 1 0%;
  min-width: 0;
  padding: ${spacing(8)} ${spacing(4)} ${spacing(12)};

  & > * + * {
    margin-top: ${spacing(8)};
  }

  ${mediaUp('md')} {
    padding: ${spacing(14)} ${spacing(12)} ${spacing(20)};
  }
`;

const MainHeader = styled.div`
  & > * + * {
    margin-top: ${spacing(2)};
  }
`;

// The grid is one rounded box: cells draw the inner lines (right and bottom)
// and drop them on the box's own edges.
const Grid = styled.div`
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  overflow: hidden;

  & > [data-apps-stage-cell] {
    border-right: none;
  }

  & > [data-apps-stage-cell]:last-child {
    border-bottom: none;
  }

  ${mediaUp('sm')} {
    grid-template-columns: repeat(2, minmax(0, 1fr));

    & > [data-apps-stage-cell]:nth-child(odd) {
      border-right: 1px solid ${semanticColor.line};
    }

    /* An odd count would leave an empty slot: the last app takes the row. */
    & > [data-apps-stage-cell]:nth-child(odd):last-child {
      border-right: none;
      grid-column: 1 / -1;
    }

    & > [data-apps-stage-cell]:nth-child(odd):nth-last-child(-n + 2),
    & > [data-apps-stage-cell]:nth-child(odd):nth-last-child(-n + 2) + * {
      border-bottom: none;
    }
  }

  /* Hovering one cell isolates it: the others step back. Mouse only, so a
     tap on touch never leaves the grid dimmed. */
  @media (hover: hover) and (pointer: fine) {
    &:has([data-apps-stage-cell]:hover) [data-apps-stage-cell]:not(:hover) {
      opacity: 0.45;
    }
  }
`;

const Categories = styled.div`
  & > * + * {
    margin-top: ${spacing(14)};
  }
`;

// Cells wait while their category is below the fold, then cascade in as it
// scrolls into view.
const Category = styled.div`
  scroll-margin-top: ${MENU_HEIGHT_PX + 32}px;

  & > * + * {
    margin-top: ${spacing(5)};
  }

  &[data-apps-stage-waiting] [data-apps-stage-cell] {
    animation-play-state: paused;
  }
`;

const CategoryHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${spacing(2.5)};
`;

const CategoryTitle = styled.h3`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4.5)};
  font-weight: ${FONT_WEIGHT.medium};
  line-height: 24px;
`;

const CategoryCount = styled.span`
  color: ${semanticColor.inkSubtle};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  line-height: 16px;
`;

const EmptyState = styled.div`
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  padding: ${spacing(12)} ${spacing(6)};
  text-align: center;
`;

// Without JS the observer never runs: no category may stay waiting.
const NO_SCRIPT_REVEAL =
  '[data-apps-stage-waiting] [data-apps-stage-cell]{animation-play-state:running!important}';

const toCategoryId = (category: string) =>
  `apps-category-${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

type AppsStageCraftCatalogueProps = {
  apps: readonly MarketplaceApp[];
  isUnavailable: boolean;
};

export function AppsStageCraftCatalogue({
  apps,
  isUnavailable,
}: AppsStageCraftCatalogueProps) {
  const { i18n } = useLingui();
  const inks = useAppsStageLogoInks(apps);
  const categoriesRef = useRef<HTMLDivElement>(null);

  const categories = useMemo(() => {
    const appsByCategory = new Map<string, MarketplaceApp[]>();

    for (const app of apps) {
      const category =
        app.category.length > 0 ? app.category : i18n._(msg`Other`);

      appsByCategory.set(category, [
        ...(appsByCategory.get(category) ?? []),
        app,
      ]);
    }

    return [...appsByCategory.entries()].toSorted((left, right) =>
      left[0].localeCompare(right[0]),
    );
  }, [apps, i18n]);

  const categoryNames = categories.map(([category]) => category);
  const [activeCategory, setActiveCategory] = useState<string | undefined>(
    categoryNames[0],
  );
  const [revealed, setRevealed] = useState<ReadonlySet<string>>(new Set());

  // Scrolling drives the index; an observer reveals each category once, as
  // it enters the viewport.
  useEffect(() => {
    const root = categoriesRef.current;

    if (root === null) {
      return;
    }

    const sections = [...root.querySelectorAll<HTMLElement>('[data-category]')];
    // The current category is the last one whose top has passed the line
    // under the menu; before the first, the first.
    const readingLine = MENU_HEIGHT_PX + 80;
    let frame = 0;

    const updateCurrent = () => {
      frame = 0;
      const passed = sections.filter(
        (section) => section.getBoundingClientRect().top <= readingLine,
      );
      const current = passed.at(-1) ?? sections[0];

      setActiveCategory(current?.dataset.category);
    };

    const handleScroll = () => {
      if (frame === 0) {
        frame = requestAnimationFrame(updateCurrent);
      }
    };

    const revealObserver = new IntersectionObserver(
      (entries) => {
        const entered = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => (entry.target as HTMLElement).dataset.category ?? '');

        if (entered.length > 0) {
          setRevealed((previous) => new Set([...previous, ...entered]));
        }
      },
      { rootMargin: '0px 0px -12% 0px' },
    );

    for (const section of sections) {
      revealObserver.observe(section);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateCurrent();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', handleScroll);
      revealObserver.disconnect();
    };
  }, [categories]);

  const jumpTo = (event: MouseEvent<HTMLAnchorElement>, category: string) => {
    const target = document.getElementById(toCategoryId(category));

    if (target === null) {
      return;
    }

    event.preventDefault();
    setActiveCategory(category);
    target.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
      block: 'start',
    });
  };

  return (
    <SectionShell flushInline rhythm="flush" scheme="dark">
      <noscript>
        <style>{NO_SCRIPT_REVEAL}</style>
      </noscript>
      <Frame>
        <Sidebar>
          <SidebarInner>
            <SidebarLabel>{i18n._(msg`Categories`)}</SidebarLabel>
            <Index aria-label={i18n._(msg`App categories`)}>
              {categories.map(([category, categoryApps]) => (
                <IndexItem
                  aria-current={activeCategory === category}
                  href={`#${toCategoryId(category)}`}
                  key={category}
                  onClick={(event) => jumpTo(event, category)}
                  style={{
                    ['--apps-stage-pastel' as string]: getAppsStagePastel(
                      category,
                      categoryNames,
                    ),
                  }}
                >
                  <IndexName>
                    <PastelDot aria-hidden />
                    {category}
                  </IndexName>
                  <IndexCount>{categoryApps.length}</IndexCount>
                </IndexItem>
              ))}
            </Index>
          </SidebarInner>
        </Sidebar>
        <Main>
          <MainHeader>
            <Heading as="h2" size="sm" weight="light">
              {i18n._(msg`All apps`)}
            </Heading>
            <Body muted size="sm">
              {i18n._(
                msg`Built by Twenty and reviewed for security and quality.`,
              )}
            </Body>
          </MainHeader>
          {categories.length === 0 ? (
            <EmptyState>
              <Body muted size="sm">
                {isUnavailable
                  ? i18n._(
                      msg`Apps can't be loaded right now. Try again in a few minutes.`,
                    )
                  : i18n._(
                      msg`No apps are available right now. Check back soon.`,
                    )}
              </Body>
            </EmptyState>
          ) : (
            <Categories ref={categoriesRef}>
              {categories.map(([category, categoryApps]) => (
                <Category
                  aria-labelledby={`${toCategoryId(category)}-title`}
                  data-apps-stage-waiting={
                    revealed.has(category) ? undefined : ''
                  }
                  data-category={category}
                  id={toCategoryId(category)}
                  key={category}
                  role="region"
                >
                  <CategoryHeader>
                    <CategoryTitle id={`${toCategoryId(category)}-title`}>
                      {category}
                    </CategoryTitle>
                    <CategoryCount>{categoryApps.length}</CategoryCount>
                  </CategoryHeader>
                  <Grid>
                    {categoryApps.map((app, index) => (
                      <AppsStageCraftCell
                        app={app}
                        index={index}
                        ink={inks[app.slug]}
                        isBeta={APPS_STAGE_BETA_APP_NAMES.includes(
                          app.name.trim().toLowerCase(),
                        )}
                        key={app.slug}
                        pastel={getAppsStagePastel(app.category, categoryNames)}
                      />
                    ))}
                  </Grid>
                </Category>
              ))}
            </Categories>
          )}
        </Main>
      </Frame>
    </SectionShell>
  );
}
