import { isDefined } from '@ui/utilities/utils/isDefined';

const getNearestEnabledCell = ({
  rowCells,
  column,
  isEnabledCell,
}: {
  rowCells: HTMLElement[];
  column: number;
  isEnabledCell: (cell: HTMLElement | undefined) => cell is HTMLElement;
}) => {
  const targetColumn = Math.min(column, rowCells.length - 1);

  for (let distance = 0; distance < rowCells.length; distance++) {
    const nearestCell = [
      rowCells[targetColumn - distance],
      rowCells[targetColumn + distance],
    ].find(isEnabledCell);

    if (isDefined(nearestCell)) {
      return nearestCell;
    }
  }

  return undefined;
};

export const getNextDropdownGridItem = ({
  key,
  items,
  currentItem,
  search,
  isRightToLeft,
}: {
  key: string;
  items: HTMLElement[];
  currentItem: HTMLElement | undefined;
  search: HTMLInputElement | null;
  isRightToLeft: boolean;
}): HTMLElement | undefined => {
  const section = currentItem?.closest<HTMLElement>('[data-dropdown-columns]');
  const columns = Number(section?.dataset.dropdownColumns);
  const isArrowKey = [
    'ArrowUp',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
  ].includes(key);

  if (
    !isDefined(section) ||
    !isDefined(currentItem) ||
    !isArrowKey ||
    columns < 1
  ) {
    return undefined;
  }

  const cells = Array.from(
    section.querySelectorAll<HTMLElement>('[data-dropdown-item]'),
  ).filter((item) => item.closest('[data-dropdown-columns]') === section);
  const currentIndex = cells.indexOf(currentItem);
  const currentRow = Math.floor(currentIndex / columns);
  const currentColumn = currentIndex % columns;
  const isVertical = key === 'ArrowUp' || key === 'ArrowDown';
  const forwardKey = isRightToLeft ? 'ArrowLeft' : 'ArrowRight';
  const step = key === 'ArrowDown' || key === forwardKey ? 1 : -1;
  const rowCount = Math.ceil(cells.length / columns);
  const enabledItems = new Set(items);
  const isEnabledCell = (cell: HTMLElement | undefined): cell is HTMLElement =>
    isDefined(cell) && enabledItems.has(cell);

  if (isVertical) {
    for (let row = currentRow + step; row >= 0 && row < rowCount; row += step) {
      const sameColumnCell =
        cells[Math.min(row * columns + currentColumn, cells.length - 1)];

      if (isEnabledCell(sameColumnCell)) {
        return sameColumnCell;
      }
    }

    for (let row = currentRow + step; row >= 0 && row < rowCount; row += step) {
      const nearestCell = getNearestEnabledCell({
        rowCells: cells.slice(row * columns, (row + 1) * columns),
        column: currentColumn,
        isEnabledCell,
      });

      if (isDefined(nearestCell)) {
        return nearestCell;
      }
    }

    const sectionItems = cells.filter(isEnabledCell);
    const boundaryItem =
      step < 0 ? sectionItems[0] : sectionItems[sectionItems.length - 1];
    const adjacentItem = isDefined(boundaryItem)
      ? items[items.indexOf(boundaryItem) + step]
      : undefined;

    return adjacentItem ?? (step < 0 ? search : undefined) ?? currentItem;
  }

  for (
    let column = currentColumn + step;
    column >= 0 && column < columns;
    column += step
  ) {
    const nextItem = cells[currentRow * columns + column];

    if (isEnabledCell(nextItem)) {
      return nextItem;
    }
  }

  return currentItem;
};
