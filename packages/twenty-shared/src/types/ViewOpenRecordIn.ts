export enum ViewOpenRecordIn {
  SIDE_PANEL = 'SIDE_PANEL',
  RECORD_PAGE = 'RECORD_PAGE',
  USER_PREFERENCE = 'USER_PREFERENCE',
}

// Where a record actually opens. USER_PREFERENCE defers to the workspace
// member's own setting, so it is a question rather than an answer.
export type ResolvedOpenRecordIn = Exclude<
  ViewOpenRecordIn,
  ViewOpenRecordIn.USER_PREFERENCE
>;
