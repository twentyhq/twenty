export const zIndex = {
  base: 0,
  floatingNav: 10,
  drawer: 90,
  stickyHeader: 200,
  modal: 300,
  portalTop: 9999,
} as const;

export type ZIndexToken = keyof typeof zIndex;
