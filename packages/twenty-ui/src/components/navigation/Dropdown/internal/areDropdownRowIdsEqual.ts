export const areDropdownRowIdsEqual = ({
  rowIds,
  otherRowIds,
}: {
  rowIds: string[];
  otherRowIds: string[];
}) =>
  rowIds.length === otherRowIds.length &&
  rowIds.every((rowId, index) => rowId === otherRowIds[index]);
