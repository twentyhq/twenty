export type ZIndexToken = 'base' | 'drawer' | 'stickyHeader' | 'modal';

export const Z_INDEX: Record<ZIndexToken, number> = {
  base: 0,
  drawer: 90,
  stickyHeader: 200,
  modal: 300,
};
