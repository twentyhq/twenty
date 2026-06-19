export type ZIndexToken =
  | 'base'
  | 'drawer'
  | 'floatingNav'
  | 'stickyHeader'
  | 'modal'
  | 'portal';

export const Z_INDEX: Record<ZIndexToken, number> = {
  base: 0,
  drawer: 90,
  floatingNav: 100,
  stickyHeader: 200,
  modal: 300,
  // Body-portaled overlays that must clear everything (escaped traffic
  // lights bouncing across the page).
  portal: 400,
};
