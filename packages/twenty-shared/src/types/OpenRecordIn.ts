// Where a record actually opens. Stored as a workspace member's preference and
// returned by the frontend resolver; the deprecated ViewOpenRecordIn dies with
// the view column it types.
export enum OpenRecordIn {
  SIDE_PANEL = 'SIDE_PANEL',
  RECORD_PAGE = 'RECORD_PAGE',
}
