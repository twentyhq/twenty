export enum PageLayoutTabLayoutMode {
  GRID = 'GRID',
  VERTICAL_LIST = 'VERTICAL_LIST',
  /**
   * @deprecated Solo full-page tabs are no longer stored as a layout mode.
   * Presentation (solo vs stack) is derived from the tab's widgets. Kept only to
   * read layouts persisted before this change; nothing new should write it.
   */
  CANVAS = 'CANVAS',
}
