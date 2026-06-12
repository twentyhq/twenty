'use client';

import { styled } from '@linaria/react';
import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { ProductVisual } from '@/app-preview/product-visual/product-visual';
import {
  observeElementSize,
  useMediaQuery,
  useScheduledOnScroll,
} from '@/platform/motion';
import { useMenuStyleWriter } from '@/platform/menu-style';
import {
  BREAKPOINT_PX,
  buildSchemeDeclarations,
  color,
  fontSize,
  mediaUp,
  PRODUCT_HERO_SCENE,
  spacing,
} from '@/tokens';
import { Button, Container, Heading } from '@/ui';

import { type AiHeroTab } from './ai-hero-tabs';
import {
  computeHeroScrollModel,
  type HeroScrollModel,
} from './product-hero-scroll-model';
import { ProductBackdrop } from './product-backdrop';
import { TabButton } from './tab-button';
import { TabButtons } from './tab-buttons';

type HeroVisualScrollProps = {
  aiBody: string;
  aiHeading: string;
  ctaHref: string;
  ctaLabel: string;
  introBody: string;
  introHeading: string;
  introSecondaryCta?: ReactNode;
  tabs: AiHeroTab[];
};

type StackTargetMetric = {
  offset: number;
  width: number;
};

// The sticky menu's height: the track tucks under it so the wipe line
// meets the nav band exactly.
const NAV_HEIGHT_PX = 64;

const DESKTOP_QUERY = `(min-width: ${BREAKPOINT_PX.md}px)`;

// The deck's authored resting fan: vertical offsets and scales per card.
const STACK_BASE_OFFSETS = [0, 4, 8, 12];
const STACK_BASE_SCALES = [1, 0.99, 0.98, 0.97];

// The discrete scroll states (everything continuous travels as CSS
// custom properties on the track).
type HeroDiscreteState = Pick<
  HeroScrollModel,
  | 'aiPlaybackEnabled'
  | 'aiPointerEventsEnabled'
  | 'heroAtStart'
  | 'introCursorsActive'
  | 'isCrossing'
  | 'menuDark'
  | 'menuElevated'
  | 'selectorRevealReady'
>;

const INITIAL_DISCRETE: HeroDiscreteState = {
  aiPlaybackEnabled: false,
  aiPointerEventsEnabled: false,
  heroAtStart: true,
  introCursorsActive: true,
  isCrossing: false,
  menuDark: false,
  menuElevated: true,
  selectorRevealReady: false,
};

function pickDiscrete(model: HeroScrollModel): HeroDiscreteState {
  return {
    aiPlaybackEnabled: model.aiPlaybackEnabled,
    aiPointerEventsEnabled: model.aiPointerEventsEnabled,
    heroAtStart: model.heroAtStart,
    introCursorsActive: model.introCursorsActive,
    isCrossing: model.isCrossing,
    menuDark: model.menuDark,
    menuElevated: model.menuElevated,
    selectorRevealReady: model.selectorRevealReady,
  };
}

function sameDiscrete(a: HeroDiscreteState, b: HeroDiscreteState): boolean {
  return (
    a.aiPlaybackEnabled === b.aiPlaybackEnabled &&
    a.aiPointerEventsEnabled === b.aiPointerEventsEnabled &&
    a.heroAtStart === b.heroAtStart &&
    a.introCursorsActive === b.introCursorsActive &&
    a.isCrossing === b.isCrossing &&
    a.menuDark === b.menuDark &&
    a.menuElevated === b.menuElevated &&
    a.selectorRevealReady === b.selectorRevealReady
  );
}

const PatternOverlay = styled.div`
  inset: 0;
  pointer-events: none;
  position: absolute;
  z-index: -1;
`;

const ScrollTrack = styled.div`
  display: none;

  ${mediaUp('md')} {
    display: block;
    height: 200vh;
    margin-top: -${NAV_HEIGHT_PX}px;
    position: relative;
    width: 100%;
  }
`;

const MobileRoot = styled.div`
  ${mediaUp('md')} {
    display: none;
  }
`;

const StickyFrame = styled.div`
  background-color: ${color('white')};
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  position: sticky;
  top: 0;
  width: 100%;
`;

const FullLayer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  inset: 0;
  justify-content: flex-start;
  padding-top: 94px;
  position: absolute;
  row-gap: ${spacing(6)};
  /* Both layers rasterize on their own plane so their text anti-aliases
     identically through the wipe. */
  transform: translateZ(0);

  &[data-face='light'] {
    ${buildSchemeDeclarations('light')}
    background-color: ${color('white')};
    color: ${color('black')};
  }

  /* The dark layer wipes up from the bottom as the morph plays. */
  &[data-face='dark'] {
    ${buildSchemeDeclarations('dark')}
    background-color: ${PRODUCT_HERO_SCENE.darkSurface};
    clip-path: inset(calc((1 - var(--hero-morph, 0)) * 100%) 0 0 0);
    color: ${color('white')};
    pointer-events: none;
  }

  &[data-face='dark'][data-interactive] {
    pointer-events: auto;
  }

  ${mediaUp('md')} {
    padding-top: 112px;
  }
`;

const IntroContainer = styled(Container)`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  justify-items: center;
  min-width: 0;
  position: relative;
  row-gap: ${spacing(8)};
  text-align: center;
  width: 100%;
  z-index: 1;
`;

const HeadingSlot = styled.div`
  max-width: 360px;
  min-height: 96px;
  position: relative;
  width: 100%;

  ${mediaUp('md')} {
    max-width: 672px;
  }
`;

// Both faces render both headings (the inactive one invisible) so the
// slot reserves the taller measure and nothing jumps mid-wipe.
const ContentLayer = styled.div`
  inset: 0;
  position: absolute;

  &[data-active='true'] {
    position: relative;
  }

  &[data-active='false'] {
    opacity: 0;
    pointer-events: none;
  }
`;

const BodyText = styled.div`
  font-size: ${fontSize(4)};
  line-height: 1.55;
  margin: 0;
  max-width: 360px;
  position: relative;
  width: 100%;

  &[data-face='light'] {
    color: ${color('black-60')};
  }

  &[data-face='dark'] {
    color: ${color('white-70')};
  }

  ${mediaUp('md')} {
    max-width: 591px;
  }
`;

const HeadingGroup = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${spacing(3)};
  width: 100%;
`;

const ActionSlot = styled.div`
  min-height: 40px;
  position: relative;
  width: 100%;
`;

const CtaLayer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(3)};
  inset: 0;
  justify-content: center;
  position: absolute;

  &[data-active='true'] {
    position: relative;
  }

  &[data-active='false'] {
    opacity: 0;
    pointer-events: none;
  }
`;

// At lg+ the row of tabs hides (the stacked deck replaces it) but keeps
// its layout so the deck can measure the row positions to spread into.
const MeasureTabButtons = styled(TabButtons)`
  width: 100%;

  ${mediaUp('lg')} {
    opacity: 0;
    pointer-events: none;
    visibility: hidden;
  }
`;

const StackedTabDeck = styled.div`
  display: none;
  inset: 0;
  pointer-events: none;
  position: absolute;

  &[data-interactive] {
    pointer-events: auto;
  }

  ${mediaUp('lg')} {
    display: block;
  }
`;

// All motion derives from the track's custom properties: appear fades the
// deck in, align settles the fanned cards onto one baseline, spread sends
// each card to its measured row position.
const StackedTabCard = styled.div`
  left: 50%;
  max-width: min(500px, calc(100vw - 160px));
  opacity: var(--hero-stack-appear, 0);
  position: absolute;
  top: 0;
  transform: translate3d(
      calc(
        -50% + var(--card-offset, 0) * var(--hero-stack-spread-eased, 0) * 1px
      ),
      calc(var(--card-base-offset, 0) * (1 - var(--hero-stack-align, 0)) * 1px),
      0
    )
    scale(
      calc(
        var(--card-base-scale, 1) +
          (1 - var(--card-base-scale, 1)) * var(--hero-stack-align, 0)
      )
    );
  transform-origin: center top;
  transition: none;
  will-change: opacity, transform;

  &[data-measured] {
    width: calc(
      (
          var(--hero-stack-base-width, 0) +
            (var(--card-target-width, 0) - var(--hero-stack-base-width, 0)) *
            var(--hero-stack-spread-eased, 0)
        ) * 1px
    );
  }
`;

const VisualWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  position: relative;
  width: 100%;
  z-index: 1;
`;

const MobileSection = styled.div<{ $secondary?: boolean }>`
  align-items: center;
  background-color: ${({ $secondary }) =>
    $secondary ? PRODUCT_HERO_SCENE.darkSurface : color('white')};
  color: ${({ $secondary }) => ($secondary ? color('white') : color('black'))};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-top: ${({ $secondary }) =>
    $secondary ? spacing(12) : spacing(7.5)};
  position: relative;
  row-gap: ${spacing(6)};
  width: 100%;
`;

const MobileVisualWrapper = styled.div`
  isolation: isolate;
  overflow: hidden;
  padding-bottom: ${spacing(16)};
  padding-left: ${spacing(4)};
  padding-right: ${spacing(4)};
  position: relative;
  width: 100%;
`;

// Non-clipping layer hosting the collaboration cursors above the visual;
// the inner wrapper still clips the bleed.
const MobileCursorLayer = styled.div`
  position: relative;
  width: 100%;
`;

export function HeroVisualScroll({
  aiBody,
  aiHeading,
  ctaHref,
  ctaLabel,
  introBody,
  introHeading,
  introSecondaryCta,
  tabs,
}: HeroVisualScrollProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const rowButtonsRef = useRef<HTMLDivElement>(null);
  const menuWriter = useMenuStyleWriter();
  const isDesktop = useMediaQuery(DESKTOP_QUERY, { serverFallback: true });
  const isPhone = useMediaQuery(PRODUCT_HERO_SCENE.panelOnlyMaxQuery);
  const [activeTab, setActiveTab] = useState(0);
  const [discrete, setDiscrete] = useState(INITIAL_DISCRETE);
  const [introLayerEl, setIntroLayerEl] = useState<HTMLDivElement | null>(null);
  const [mobileIntroLayerEl, setMobileIntroLayerEl] =
    useState<HTMLDivElement | null>(null);
  const [stackTargetMetrics, setStackTargetMetrics] = useState<
    StackTargetMetric[]
  >([]);
  const lastMenuBackgroundRef = useRef<string | null>(null);

  // One pass per frame: continuous values go straight to the track's
  // custom properties (and the menu's background channel); React renders
  // only when a discrete state flips.
  const applyScrollModel = useCallback(() => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const model = computeHeroScrollModel({
      trackTop: track.getBoundingClientRect().top,
      trackHeight: track.offsetHeight,
      viewportHeight: window.innerHeight,
    });

    const trackStyle = track.style;
    trackStyle.setProperty('--hero-morph', String(model.morphProgress));
    trackStyle.setProperty(
      '--hero-stack-appear',
      String(model.stackAppearProgress),
    );
    trackStyle.setProperty(
      '--hero-stack-align',
      String(model.stackAlignProgress),
    );
    trackStyle.setProperty(
      '--hero-stack-spread-eased',
      String(model.stackSpreadEasedProgress),
    );
    trackStyle.setProperty(
      '--ai-panel-progress',
      String(model.aiPanelProgress),
    );

    if (menuWriter && model.menuBackground !== lastMenuBackgroundRef.current) {
      lastMenuBackgroundRef.current = model.menuBackground;
      menuWriter.setBackground(model.menuBackground);
    }

    const nextDiscrete = pickDiscrete(model);
    setDiscrete((previous) =>
      sameDiscrete(previous, nextDiscrete) ? previous : nextDiscrete,
    );
  }, [menuWriter]);

  useScheduledOnScroll(applyScrollModel, { enabled: isDesktop });

  // The page's menu restyle: scheme/elevation flip at thresholds; below
  // the desktop split the menu keeps its defaults (the mobile layout
  // scrolls normally). Blur stays off on this page — it smears the wipe.
  useEffect(() => {
    if (!menuWriter) {
      return undefined;
    }

    if (!isDesktop) {
      menuWriter.setBackground(null);
      lastMenuBackgroundRef.current = null;
      menuWriter.setOverride({ suppressBackdropBlur: true });
      return undefined;
    }

    menuWriter.setOverride({
      scheme: discrete.menuDark ? 'dark' : 'light',
      suppressBackdropBlur: true,
      suppressElevation: !discrete.menuElevated,
    });

    return undefined;
  }, [menuWriter, isDesktop, discrete.menuDark, discrete.menuElevated]);

  // Leaving the page hands the menu back untouched.
  useEffect(() => {
    if (!menuWriter) {
      return undefined;
    }

    return () => {
      menuWriter.setBackground(null);
      menuWriter.setOverride({});
    };
  }, [menuWriter]);

  // Returning to the top rewinds the demo to the first scene.
  useEffect(() => {
    if (discrete.heroAtStart) {
      setActiveTab(0);
    }
  }, [discrete.heroAtStart]);

  // The deck spreads onto the hidden tab row's measured geometry.
  useEffect(() => {
    const rowContainer = rowButtonsRef.current;

    if (!rowContainer) {
      return undefined;
    }

    const updateStackTargets = () => {
      const buttons = Array.from(rowContainer.querySelectorAll('button'));

      if (buttons.length !== tabs.length) {
        return;
      }

      const containerRect = rowContainer.getBoundingClientRect();
      const containerCenter = containerRect.left + containerRect.width / 2;

      setStackTargetMetrics(
        buttons.map((button) => {
          const rect = button.getBoundingClientRect();

          return {
            offset: rect.left + rect.width / 2 - containerCenter,
            width: rect.width,
          };
        }),
      );
    };

    updateStackTargets();
    window.addEventListener('resize', updateStackTargets);
    const stopObserving = observeElementSize(rowContainer, updateStackTargets);

    return () => {
      window.removeEventListener('resize', updateStackTargets);
      stopObserving();
    };
  }, [tabs]);

  const stackSpreadMetrics =
    stackTargetMetrics.length === tabs.length ? stackTargetMetrics : null;
  const stackWidth = stackSpreadMetrics?.[0]?.width ?? null;
  const stackCards = tabs.map((tab, tabNumber) => ({ tab, tabNumber }));

  // Each face renders both copies so the slot reserves the taller
  // measure; the inactive copy is invisible AND hidden from assistive
  // tech (it exists only as a measuring stick). The page's one h1 lives
  // on the light face.
  const headingPair = (face: 'light' | 'dark') => (
    <HeadingGroup>
      <HeadingSlot>
        <ContentLayer
          aria-hidden={face === 'light' ? undefined : 'true'}
          data-active={face === 'light'}
        >
          <Heading as={face === 'light' ? 'h1' : 'h2'} size="lg" weight="light">
            {introHeading}
          </Heading>
        </ContentLayer>
        <ContentLayer
          aria-hidden={face === 'dark' ? undefined : 'true'}
          data-active={face === 'dark'}
        >
          <Heading as="h2" size="lg" weight="light">
            {aiHeading}
          </Heading>
        </ContentLayer>
      </HeadingSlot>
      <BodyText data-face={face}>
        <ContentLayer
          aria-hidden={face === 'light' ? undefined : 'true'}
          data-active={face === 'light'}
        >
          {introBody}
        </ContentLayer>
        <ContentLayer
          aria-hidden={face === 'dark' ? undefined : 'true'}
          data-active={face === 'dark'}
        >
          {aiBody}
        </ContentLayer>
      </BodyText>
    </HeadingGroup>
  );

  const introCtas = (
    <>
      <Button href={ctaHref} label={ctaLabel} />
      {introSecondaryCta}
    </>
  );

  const mobileLayout = (
    <MobileRoot>
      <MobileSection>
        <IntroContainer>
          <HeadingGroup>
            <HeadingSlot>
              <ContentLayer data-active>
                <Heading as="h1" size="lg" weight="light">
                  {introHeading}
                </Heading>
              </ContentLayer>
            </HeadingSlot>
            <BodyText data-face="light">
              <ContentLayer data-active>{introBody}</ContentLayer>
            </BodyText>
          </HeadingGroup>
          <ActionSlot>
            <CtaLayer data-active>{introCtas}</CtaLayer>
          </ActionSlot>
        </IntroContainer>
        <MobileCursorLayer ref={setMobileIntroLayerEl}>
          <MobileVisualWrapper>
            <PatternOverlay>
              {!isDesktop ? <ProductBackdrop dash="blue" /> : null}
            </PatternOverlay>
            <ProductVisual
              activeScene={0}
              collaborative
              compactCursorTour
              cursorActive={!isDesktop}
              cursorLayer={mobileIntroLayerEl}
              playbackEnabled={false}
              presentation="bleed"
            />
          </MobileVisualWrapper>
        </MobileCursorLayer>
      </MobileSection>

      <MobileSection $secondary>
        <IntroContainer>
          <HeadingGroup>
            <HeadingSlot>
              <ContentLayer data-active>
                <Heading as="h2" size="lg" weight="light">
                  {aiHeading}
                </Heading>
              </ContentLayer>
            </HeadingSlot>
            <BodyText data-face="dark">
              <ContentLayer data-active>{aiBody}</ContentLayer>
            </BodyText>
          </HeadingGroup>
          <ActionSlot>
            <CtaLayer data-active>
              <TabButtons
                activeIndex={activeTab}
                idPrefix="product-hero-mobile"
                onSelect={setActiveTab}
                panelId="product-hero-mobile-panel"
                tabs={tabs}
              />
            </CtaLayer>
          </ActionSlot>
        </IntroContainer>
        <MobileVisualWrapper id="product-hero-mobile-panel" role="tabpanel">
          <PatternOverlay>
            {!isDesktop ? <ProductBackdrop dash="white" /> : null}
          </PatternOverlay>
          <ProductVisual
            activeScene={activeTab + 1}
            playbackEnabled={!isDesktop}
            presentation={isPhone ? 'panel' : 'fluid'}
          />
        </MobileVisualWrapper>
      </MobileSection>
    </MobileRoot>
  );

  const deckStyle = (
    stackWidth !== null
      ? { '--hero-stack-base-width': String(stackWidth) }
      : undefined
  ) as CSSProperties | undefined;

  return (
    <>
      {mobileLayout}
      <ScrollTrack ref={trackRef}>
        <StickyFrame>
          <FullLayer data-face="light" ref={setIntroLayerEl}>
            <IntroContainer>
              {headingPair('light')}
              <ActionSlot>
                <CtaLayer data-active>{introCtas}</CtaLayer>
                <CtaLayer aria-hidden="true" data-active={false}>
                  <MeasureTabButtons
                    activeIndex={activeTab}
                    idPrefix="product-hero-intro"
                    onSelect={setActiveTab}
                    panelId="product-hero-ai-panel"
                    tabs={tabs}
                  />
                </CtaLayer>
              </ActionSlot>
            </IntroContainer>
            <VisualWrapper>
              <PatternOverlay>
                {isDesktop ? <ProductBackdrop dash="blue" /> : null}
              </PatternOverlay>
              <ProductVisual
                activeScene={0}
                collaborative
                cursorActive={discrete.introCursorsActive}
                cursorLayer={introLayerEl}
                fill
                playbackEnabled={false}
                presentation="fluid"
              />
            </VisualWrapper>
          </FullLayer>

          <FullLayer
            data-face="dark"
            data-interactive={
              discrete.aiPointerEventsEnabled ? '' : undefined
            }
          >
            <IntroContainer>
              {headingPair('dark')}
              <ActionSlot>
                <CtaLayer aria-hidden="true" data-active={false}>
                  <Button href={ctaHref} label={ctaLabel} />
                </CtaLayer>
                <CtaLayer data-active>
                  <MeasureTabButtons
                    activeIndex={activeTab}
                    containerRef={rowButtonsRef}
                    idPrefix="product-hero-ai-measure"
                    onSelect={setActiveTab}
                    panelId="product-hero-ai-panel"
                    tabs={tabs}
                  />
                  <StackedTabDeck
                    aria-hidden={discrete.selectorRevealReady ? undefined : 'true'}
                    data-interactive={
                      discrete.selectorRevealReady ? '' : undefined
                    }
                    style={deckStyle}
                  >
                    {stackCards.map(({ tab, tabNumber }) => {
                      const targetMetric = stackSpreadMetrics?.[tabNumber];
                      const cardStyle = {
                        '--card-base-offset': String(
                          STACK_BASE_OFFSETS[tabNumber],
                        ),
                        '--card-base-scale': String(
                          STACK_BASE_SCALES[tabNumber],
                        ),
                        '--card-offset': String(targetMetric?.offset ?? 0),
                        '--card-target-width': String(
                          targetMetric?.width ?? 0,
                        ),
                        zIndex: 4 - tabNumber,
                      } as CSSProperties;

                      return (
                        <StackedTabCard
                          data-measured={targetMetric ? '' : undefined}
                          key={tabNumber}
                          style={cardStyle}
                        >
                          <TabButton
                            controls="product-hero-ai-panel"
                            id={`product-hero-ai-stack-tab-${tabNumber}`}
                            isActive={
                              discrete.selectorRevealReady &&
                              tabNumber === activeTab
                            }
                            onSelect={() => setActiveTab(tabNumber)}
                            tab={tab}
                          />
                        </StackedTabCard>
                      );
                    })}
                  </StackedTabDeck>
                </CtaLayer>
              </ActionSlot>
            </IntroContainer>
            <VisualWrapper id="product-hero-ai-panel" role="tabpanel">
              <PatternOverlay>
                {isDesktop ? <ProductBackdrop dash="white" /> : null}
              </PatternOverlay>
              <ProductVisual
                activeScene={activeTab + 1}
                fill
                playbackEnabled={discrete.aiPlaybackEnabled}
                presentation="fluid"
              />
            </VisualWrapper>
          </FullLayer>
        </StickyFrame>
      </ScrollTrack>
    </>
  );
}
