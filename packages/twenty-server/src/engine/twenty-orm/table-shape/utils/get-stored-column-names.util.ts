import { type WorkspaceTableShape } from 'src/engine/twenty-orm/table-shape/types/workspace-table-shape.type';

// Computed columns exist only in read queries: a write returns the stored ones and its caller reads the rest
export const getStoredColumnNames = ({
  tableShape,
  columnNames,
}: {
  tableShape: WorkspaceTableShape;
  columnNames: string[];
}): string[] =>
  columnNames.filter(
    (columnName) =>
      !(tableShape.columnShapeByColumnName[columnName]?.isComputed ?? false),
  );
