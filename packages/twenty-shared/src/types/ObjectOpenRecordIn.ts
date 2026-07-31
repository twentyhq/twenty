// How records of an object open. USER_CHOICE hands the decision to each
// workspace member's own OpenRecordIn preference; the other two pin the
// object, for records that only work on a full page or only make sense as a
// quick panel.
export enum ObjectOpenRecordIn {
  SIDE_PANEL = 'SIDE_PANEL',
  RECORD_PAGE = 'RECORD_PAGE',
  USER_CHOICE = 'USER_CHOICE',
}
