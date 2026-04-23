/**
 * Global z-index scale.
 *
 * Use these tokens for any element that escapes its parent's stacking
 * context — fixed-positioned overlays, modals, sticky headers, portals.
 *
 * For purely *local* stacking inside a single component (siblings layered
 * 0/1/2/3 inside a parent that already establishes a stacking context),
 * raw numeric values are still fine: their meaning is local to that
 * component and there is no cross-page coordination problem.
 *
 * Existing numeric values are preserved so this refactor is a no-op at
 * runtime — the goal is to make the painted ordering explicit, grep-able,
 * and discoverable when adding a new modal/drawer/header in future.
 */
export const zIndex = {
  /** Decorative background layer behind in-flow content. */
  base: 0,
  /** In-page fixed-position floaty (e.g. case-study section nav). */
  floatingNav: 10,
  /** Mobile menu drawer panel inside its portal. */
  drawer: 90,
  /** Site-wide sticky page header. */
  stickyHeader: 200,
  /** Modal overlays, dropdown popups — anything above the sticky header. */
  modal: 300,
  /** Last-resort portal layer (terminal traffic-light dots fired through a body portal). */
  portalTop: 9999,
} as const;

export type ZIndexToken = keyof typeof zIndex;
