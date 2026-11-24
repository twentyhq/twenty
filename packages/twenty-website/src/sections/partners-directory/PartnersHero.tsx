'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import { type ReactNode } from 'react';

import { HalftoneImageBackdrop } from '@/platform/visuals/rigs/HalftoneImageBackdrop';
import { HalftoneModel } from '@/platform/visuals/rigs/HalftoneModel';
import { GUTTER, HERO_COMPOSITION, mediaUp, RHYTHM, spacing } from '@/tokens';
import { Body, GuideCrosshair, Heading, HeadingPair, SectionShell } from '@/ui';

import { GLOBE_MODEL_SETTINGS } from './globe-model-settings';
import { GLOBE_VIEW } from './globe-view';
import { PARTNERS_HERO_BACKDROP } from './partners-hero-backdrop';

// A real world in 3D (public/models/partners-globe.glb, Natural Earth land
// on a 1° grid, raised a little on the sphere), drawn by the site's halftone
// engine.
const GLOBE_MODEL_URL = '/models/partners-globe.glb';

// A banner: the top of a large globe, cut by the hero's bottom edge and, on
// narrow screens, by the screen's sides. Its height follows the globe, so the
// hero ends where the visual does.
const GlobeBanner = styled.div`
  --partners-globe-size: clamp(560px, 100vw, 1100px);
  height: calc(var(--partners-globe-size) * 0.36);
  margin-bottom: calc(-1 * ${spacing(RHYTHM.hero.bottom.base)});
  margin-inline: calc(-1 * ${spacing(GUTTER.base)});
  margin-top: ${HERO_COMPOSITION.ctaToVisualGapPx}px;
  /* The rings reach up behind the copy; the hero's own clip still cuts the
     globe at its bottom edge and the sides on narrow screens. */
  overflow: visible;
  position: relative;

  ${mediaUp('md')} {
    margin-bottom: calc(-1 * ${spacing(RHYTHM.hero.bottom.md)});
    margin-inline: calc(-1 * ${spacing(GUTTER.md)});
  }
`;

// The rings around the globe, sized and placed from the globe itself so they
// keep clear of it at every width. The source is drawn for this box
// (hero_pattern.py, shape « halo »): globe centre at 50% / 115.5% of the box,
// radius 70% of its height, box ratio 3600 / 1250.
const RibbonsField = styled.div`
  --partners-rings-height: calc(var(--partners-globe-size) / 1.4);
  height: var(--partners-rings-height);
  left: 50%;
  pointer-events: none;
  position: absolute;
  top: calc(
    var(--partners-globe-size) * 0.47 - var(--partners-rings-height) * 1.155
  );
  transform: translateX(-50%);
  width: calc(var(--partners-rings-height) * 2.88);
`;

const GlobeBox = styled.div`
  aspect-ratio: 1;
  left: 50%;
  position: absolute;
  /* Part of the empty cap above 70°N stays above; the land starts below. */
  top: calc(var(--partners-globe-size) * -0.03);
  transform: translateX(-50%);
  width: var(--partners-globe-size);
`;

// The home hero's text block: HeadingPair, the same measures, 32px to the
// actions.
const Copy = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  text-align: center;
  width: 100%;

  & > * + * {
    margin-top: ${spacing(8)};
  }
`;

const HeadingMeasure = styled.div`
  max-width: 672px;
  width: 100%;
`;

const BodyMeasure = styled.div`
  margin-inline: auto;
  max-width: 591px;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(3)};
  justify-content: center;
`;

type PartnersHeroProps = {
  actions: ReactNode;
};

export function PartnersHero({ actions }: PartnersHeroProps) {
  const { i18n } = useLingui();

  return (
    <SectionShell
      background={
        // The hero closes on a hairline with the + under the globe.
        <GuideCrosshair
          crossX="50%"
          crossY="calc(100% - 1px)"
          verticalLines={false}
        />
      }
      rhythm="hero"
      scheme="muted"
    >
      <Copy data-halftone-exclude="">
        <HeadingPair>
          <HeadingMeasure>
            <Heading as="h1" size="lg" weight="light">
              {i18n._(msg`Hire the people who *build on Twenty*`)}
            </Heading>
          </HeadingMeasure>
          <BodyMeasure>
            <Body muted size="sm">
              {i18n._(
                msg`Certified partners who set up your CRM to match how your company works, from the migration to the custom apps.`,
              )}
            </Body>
          </BodyMeasure>
        </HeadingPair>
        <Actions>{actions}</Actions>
      </Copy>
      <GlobeBanner aria-hidden>
        <RibbonsField>
          <HalftoneImageBackdrop
            imageUrl={PARTNERS_HERO_BACKDROP.imageUrl}
            settings={PARTNERS_HERO_BACKDROP.settings}
          />
        </RibbonsField>
        <GlobeBox>
          <HalftoneModel
            initialPose={GLOBE_VIEW.pose}
            modelUrl={GLOBE_MODEL_URL}
            settings={GLOBE_MODEL_SETTINGS}
          />
        </GlobeBox>
      </GlobeBanner>
    </SectionShell>
  );
}
