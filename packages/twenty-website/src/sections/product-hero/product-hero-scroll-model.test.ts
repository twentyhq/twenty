import { computeHeroScrollModel } from './product-hero-scroll-model';

// A 200vh track in a 900px viewport: scrollable distance = 900px.
const VIEWPORT = 900;
const TRACK = VIEWPORT * 2;

// scrollProgress maps through smoothstep over [0, 0.55]; this inverts it
// for authoring tests against morph values.
const atScroll = (scrollProgress: number) =>
  computeHeroScrollModel({
    trackTop: -scrollProgress * VIEWPORT,
    trackHeight: TRACK,
    viewportHeight: VIEWPORT,
  });

describe('computeHeroScrollModel', () => {
  it('should rest at the intro before any scroll', () => {
    const model = atScroll(0);
    expect(model.morphProgress).toBe(0);
    expect(model.heroAtStart).toBe(true);
    expect(model.introCursorsActive).toBe(true);
    expect(model.aiPointerEventsEnabled).toBe(false);
    expect(model.aiPlaybackEnabled).toBe(false);
    expect(model.menuBackground).toBe('rgb(255, 255, 255)');
    expect(model.menuElevated).toBe(true);
    expect(model.menuDark).toBe(false);
    expect(model.controlsMenu).toBe(true);
    expect(model.stackAppearProgress).toBe(0);
  });

  it('should complete the morph at 55% of the scrollable run', () => {
    const model = atScroll(0.55);
    expect(model.morphProgress).toBe(1);
    expect(model.selectorRevealReady).toBe(true);
    expect(model.stackSpreadProgress).toBe(1);
    expect(model.stackSpreadEasedProgress).toBe(1);
    // The Ask-AI panel is deliberately still closed here; it reveals only
    // in the post-morph hold (see the panel-timing test below).
    expect(model.aiPanelProgress).toBe(0);
    expect(model.aiPlaybackEnabled).toBe(false);
  });

  it('should ease the morph through smoothstep', () => {
    // Halfway through [0, 0.55] -> linear 0.5 -> smoothstep 0.5.
    expect(atScroll(0.275).morphProgress).toBeCloseTo(0.5, 10);
    expect(atScroll(0.1375).morphProgress).toBeCloseTo(
      0.25 * 0.25 * (3 - 2 * 0.25),
      10,
    );
  });

  it('should pin the stack phases to their authored keyframes', () => {
    const half = atScroll(0.275); // morph 0.5
    expect(half.stackAppearProgress).toBeCloseTo((0.5 - 0.4) / 0.16, 10);
    expect(half.stackAlignProgress).toBe(0);
    expect(half.stackSpreadProgress).toBe(0);
  });

  it('should hold the Ask-AI panel back until the post-morph hold', () => {
    // The wipe finishes at scroll 0.55; the panel reveals over [0.60, 0.70]
    // of raw scroll progress, then holds open, and playback begins only
    // once it has fully opened.
    expect(atScroll(0.55).aiPanelProgress).toBe(0);
    expect(atScroll(0.55).aiPlaybackEnabled).toBe(false);
    expect(atScroll(0.65).aiPanelProgress).toBeCloseTo(0.5, 10);
    expect(atScroll(0.65).aiPlaybackEnabled).toBe(false);
    expect(atScroll(0.7).aiPanelProgress).toBe(1);
    expect(atScroll(0.7).aiPlaybackEnabled).toBe(true);
    expect(atScroll(1).aiPanelProgress).toBe(1);
  });

  it('should gate the AI layer at the wipe midpoint', () => {
    expect(atScroll(0.274).aiPointerEventsEnabled).toBe(false);
    expect(atScroll(0.276).aiPointerEventsEnabled).toBe(true);
    expect(atScroll(0.274).introCursorsActive).toBe(true);
    expect(atScroll(0.276).introCursorsActive).toBe(false);
  });

  it('should report transparent menu while the wipe crosses the nav band', () => {
    // wipeLineY <= 64 requires morph >= (900-64)/900 = 0.9288...; pick a
    // scroll where morph sits between that and 1.
    const crossing = atScroll(0.53);
    expect(crossing.morphProgress).toBeLessThan(1);
    expect(crossing.morphProgress).toBeGreaterThan(0.93);
    expect(crossing.isCrossing).toBe(true);
    expect(crossing.menuBackground).toBe('transparent');
    expect(crossing.menuElevated).toBe(false);
  });

  it('should settle the menu dark once the morph completes', () => {
    const settled = atScroll(0.6);
    expect(settled.isCrossing).toBe(false);
    expect(settled.navProgress).toBe(1);
    expect(settled.menuBackground).toBe('rgb(20, 20, 20)');
    expect(settled.menuDark).toBe(true);
    expect(settled.menuElevated).toBe(false);
  });

  it('should release to the ambient observer once the track bottom enters the nav band', () => {
    const exiting = computeHeroScrollModel({
      trackTop: 32 - TRACK,
      trackHeight: TRACK,
      viewportHeight: VIEWPORT,
    });
    expect(exiting.controlsMenu).toBe(false);
    expect(exiting.isCrossing).toBe(false);
  });

  it('should release the menu as the track scrolls out', () => {
    // Track bottom above the viewport top: nav fully released.
    const out = computeHeroScrollModel({
      trackTop: -TRACK,
      trackHeight: TRACK,
      viewportHeight: VIEWPORT,
    });
    expect(out.navProgress).toBe(0);
    expect(out.menuBackground).toBe('rgb(255, 255, 255)');
    expect(out.controlsMenu).toBe(false);
  });

  it('should treat a degenerate track as unscrolled', () => {
    const model = computeHeroScrollModel({
      trackTop: 0,
      trackHeight: VIEWPORT,
      viewportHeight: VIEWPORT,
    });
    expect(model.morphProgress).toBe(0);
  });
});
