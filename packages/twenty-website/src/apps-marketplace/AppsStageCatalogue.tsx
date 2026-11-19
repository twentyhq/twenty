'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { useMemo, useState } from 'react';

import {
  color,
  DURATION,
  EASING,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  mediaUp,
  MENU_HEIGHT_PX,
  REDUCED_MOTION,
  semanticColor,
  spacing,
} from '@/tokens';
import { Body, SectionShell } from '@/ui';

import { AppsStageCard } from './AppsStageCard';
import { AppsStageCorners } from './AppsStageCorners';
import { APPS_STAGE_BETA_APP_NAMES } from './apps-stage-beta-apps';
import { type MarketplaceApp } from './marketplace-app';
import { useAppsStageLogoInks } from './use-apps-stage-logo-inks';

// PROTOTYPE (?direction=d): the catalogue as one ruled sheet on the same dark
// stage: an index of categories on the left, the apps as cells on the right.
const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);

  & > * + * {
    margin-top: ${spacing(8)};
  }

  ${mediaUp('md')} {
    align-items: start;
    column-gap: ${spacing(16)};
    grid-template-columns: 200px minmax(0, 1fr);

    & > * + * {
      margin-top: 0;
    }
  }
`;

const Index = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(1)} ${spacing(5)};

  ${mediaUp('md')} {
    flex-direction: column;
    flex-wrap: nowrap;
    gap: 0;
    position: sticky;
    top: ${MENU_HEIGHT_PX + 32}px;
  }
`;

const IndexItem = styled.button`
  align-items: center;
  background: none;
  border: none;
  color: ${semanticColor.inkSubtle};
  cursor: pointer;
  display: flex;
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  font-weight: ${FONT_WEIGHT.medium};
  gap: ${spacing(2)};
  letter-spacing: 0.06em;
  padding: ${spacing(2)} 0;
  text-align: start;
  text-transform: uppercase;
  transition: color ${DURATION.xxs} ${EASING.gentle};

  ${mediaUp('md')} {
    border-bottom: 1px solid ${semanticColor.line};
    padding: ${spacing(3)} 0;
    width: 100%;
  }

  /* The eyebrow's marker, here as the selection mark. */
  &::before {
    background-color: ${color('yellow')};
    border-radius: 1px;
    content: '';
    flex-shrink: 0;
    height: 7px;
    margin-right: calc(${spacing(2)} * -1 - 14px);
    opacity: 0;
    transform: scaleX(0);
    transform-origin: 0 50%;
    transition:
      transform ${DURATION.md} ${EASING.standard},
      opacity ${DURATION.xxs} ${EASING.gentle},
      margin-right ${DURATION.md} ${EASING.standard};
    width: 14px;
  }

  &:hover {
    color: ${semanticColor.ink};
  }

  &:active {
    color: ${semanticColor.inkMuted};
  }

  &[aria-pressed='true'] {
    color: ${semanticColor.ink};
  }

  &[aria-pressed='true']::before {
    margin-right: 0;
    opacity: 1;
    transform: scaleX(1);
  }

  &:focus-visible {
    outline: 1px solid ${color('blue')};
    outline-offset: 2px;
  }

  ${REDUCED_MOTION} {
    transition: none;

    &::before {
      transition: none;
    }
  }
`;

const IndexCount = styled.span`
  color: ${semanticColor.inkSubtle};
  font-variant-numeric: tabular-nums;

  ${mediaUp('md')} {
    margin-left: auto;
  }
`;

const Sheet = styled.div`
  border: 1px solid ${semanticColor.line};
  position: relative;
`;

// Hairlines between cells are the grid's own ground showing through 1px gaps.
const Cells = styled.div`
  background-color: ${semanticColor.line};
  display: grid;
  gap: 1px;
  grid-template-columns: minmax(0, 1fr);

  ${mediaUp('sm')} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

// Completes the last row, so the sheet never ends on a bare line colour.
const Filler = styled.div`
  background-color: ${semanticColor.surface};
  background-image: repeating-linear-gradient(
    0deg,
    transparent 0 7px,
    ${color('graphite')} 7px 9px
  );
  display: none;
  mask-image: repeating-linear-gradient(
    90deg,
    ${color('black')} 0 6px,
    transparent 6px 18px
  );

  ${mediaUp('sm')} {
    display: block;
  }
`;

const FillerGround = styled.div`
  background-color: ${semanticColor.surface};
  display: none;

  ${mediaUp('sm')} {
    display: grid;
  }

  & > * {
    grid-area: 1 / 1;
  }
`;

const EmptyState = styled.div`
  padding-block: ${spacing(10)};
  text-align: center;
`;

const ALL_CATEGORIES = 'all';

const formatCount = (count: number): string => String(count).padStart(2, '0');

type AppsStageCatalogueProps = {
  apps: readonly MarketplaceApp[];
  isUnavailable: boolean;
};

export function AppsStageCatalogue({
  apps,
  isUnavailable,
}: AppsStageCatalogueProps) {
  const { i18n } = useLingui();
  const inks = useAppsStageLogoInks(apps);
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORIES);

  const categories = useMemo(() => {
    const countByCategory = new Map<string, number>();

    for (const app of apps) {
      if (app.category.length > 0) {
        countByCategory.set(
          app.category,
          (countByCategory.get(app.category) ?? 0) + 1,
        );
      }
    }

    return [...countByCategory.entries()].toSorted((left, right) =>
      left[0].localeCompare(right[0]),
    );
  }, [apps]);

  const visibleApps =
    activeCategory === ALL_CATEGORIES
      ? apps
      : apps.filter((app) => app.category === activeCategory);

  const selectCategory = (category: string) => setActiveCategory(category);

  if (apps.length === 0) {
    return (
      <SectionShell rhythm="section" scheme="dark">
        <EmptyState>
          <Body muted size="md">
            {isUnavailable
              ? i18n._(
                  msg`Apps can't be loaded right now. Try again in a few minutes.`,
                )
              : i18n._(msg`No apps are available right now. Check back soon.`)}
          </Body>
        </EmptyState>
      </SectionShell>
    );
  }

  return (
    <SectionShell keepsTopRhythm rhythm="section" scheme="dark">
      <Layout>
        {categories.length > 0 && (
          <Index aria-label={i18n._(msg`Filter apps by category`)} role="group">
            <IndexItem
              aria-pressed={activeCategory === ALL_CATEGORIES}
              onClick={() => selectCategory(ALL_CATEGORIES)}
              type="button"
            >
              {i18n._(msg`All`)}
              <IndexCount>{formatCount(apps.length)}</IndexCount>
            </IndexItem>
            {categories.map(([category, count]) => (
              <IndexItem
                aria-pressed={activeCategory === category}
                key={category}
                onClick={() => selectCategory(category)}
                type="button"
              >
                {category}
                <IndexCount>{formatCount(count)}</IndexCount>
              </IndexItem>
            ))}
          </Index>
        )}
        <Sheet>
          <AppsStageCorners />
          {/* Keyed by filter so the cells replay their entrance on change. */}
          <Cells key={activeCategory}>
            {visibleApps.map((app, index) => (
              <AppsStageCard
                app={app}
                index={index}
                ink={inks[app.slug]}
                isBeta={APPS_STAGE_BETA_APP_NAMES.includes(
                  app.name.trim().toLowerCase(),
                )}
                key={app.slug}
              />
            ))}
            {visibleApps.length % 2 === 1 && (
              <FillerGround aria-hidden>
                <Filler />
              </FillerGround>
            )}
          </Cells>
        </Sheet>
      </Layout>
    </SectionShell>
  );
}
