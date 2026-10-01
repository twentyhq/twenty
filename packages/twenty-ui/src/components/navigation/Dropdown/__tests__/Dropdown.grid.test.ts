import { getDropdownItems } from '../internal/getDropdownItems';
import { getNextDropdownItem } from '../internal/getNextDropdownItem';

const createCell = (label: string) => {
  const cell = document.createElement('button');
  cell.dataset.dropdownItem = '';
  cell.textContent = label;

  return cell;
};

const createGrid = ({
  count = 8,
  disabledIndex,
  columns = '3',
}: {
  count?: number;
  disabledIndex?: number;
  columns?: string;
} = {}) => {
  const content = document.createElement('div');
  content.dataset.dropdownContent = '';
  const search = document.createElement('input');
  const section = document.createElement('div');
  section.dataset.dropdownColumns = columns;
  content.append(search, section);
  const cells: HTMLButtonElement[] = [];

  for (let index = 0; index < count; index++) {
    const cell = createCell(`Icon ${index + 1}`);
    cell.disabled = index === disabledIndex;
    section.append(cell);
    cells.push(cell);
  }

  const navigate = ({
    key,
    from,
    isRightToLeft = false,
  }: {
    key: string;
    from: number;
    isRightToLeft?: boolean;
  }) => {
    const items = getDropdownItems(content);

    return getNextDropdownItem({
      key,
      items,
      currentIndex: items.findIndex((item) => item === cells[from]),
      search,
      isSearch: false,
      isRightToLeft,
    });
  };

  return { cells, content, search, navigate };
};

describe('Dropdown grid navigation', () => {
  it('moves across columns and between rows', () => {
    const { cells, navigate } = createGrid();

    expect(navigate({ key: 'ArrowRight', from: 0 })).toBe(cells[1]);
    expect(navigate({ key: 'ArrowDown', from: 1 })).toBe(cells[4]);
    expect(navigate({ key: 'ArrowLeft', from: 4 })).toBe(cells[3]);
    expect(navigate({ key: 'ArrowUp', from: 3 })).toBe(cells[0]);
  });

  it('keeps horizontal navigation in the current row and follows RTL', () => {
    const { cells, navigate } = createGrid();

    expect(navigate({ key: 'ArrowRight', from: 2 })).toBe(cells[2]);
    expect(navigate({ key: 'ArrowLeft', from: 3 })).toBe(cells[3]);
    expect(navigate({ key: 'ArrowLeft', from: 0, isRightToLeft: true })).toBe(
      cells[1],
    );
    expect(navigate({ key: 'ArrowRight', from: 1, isRightToLeft: true })).toBe(
      cells[0],
    );
  });

  it('skips disabled cells without shifting their grid positions', () => {
    const { cells, navigate } = createGrid({ disabledIndex: 4 });

    expect(navigate({ key: 'ArrowRight', from: 3 })).toBe(cells[5]);
    expect(navigate({ key: 'ArrowDown', from: 1 })).toBe(cells[7]);
    expect(navigate({ key: 'ArrowUp', from: 7 })).toBe(cells[1]);
  });

  it('moves to the nearest enabled cell of the next row when the column has none left', () => {
    const { cells, content, navigate } = createGrid({ disabledIndex: 7 });
    const action = document.createElement('button');
    action.dataset.dropdownItem = '';
    content.append(action);

    expect(navigate({ key: 'ArrowDown', from: 4 })).toBe(cells[6]);
    expect(navigate({ key: 'ArrowDown', from: 5 })).toBe(cells[6]);
  });

  it('stays in the grid when the cell above in the first row is disabled', () => {
    const { cells, navigate } = createGrid({ disabledIndex: 1 });

    expect(navigate({ key: 'ArrowUp', from: 4 })).toBe(cells[0]);
  });

  it('reaches enabled cells of the last row when its column is disabled', () => {
    const { cells, navigate } = createGrid({ count: 6, disabledIndex: 5 });

    expect(navigate({ key: 'ArrowDown', from: 2 })).toBe(cells[4]);
  });

  it('lands on the last cell of a partial row and stops at the last row', () => {
    const { cells, navigate } = createGrid();

    expect(navigate({ key: 'ArrowDown', from: 5 })).toBe(cells[7]);
    expect(navigate({ key: 'ArrowDown', from: 7 })).toBe(cells[7]);
  });

  it('returns from any first-row column to search and preserves Home and End', () => {
    const { cells, search, navigate } = createGrid();

    expect(navigate({ key: 'ArrowUp', from: 2 })).toBe(search);
    expect(navigate({ key: 'Home', from: 4 })).toBe(cells[0]);
    expect(navigate({ key: 'End', from: 4 })).toBe(cells[7]);
  });

  it('moves to the next section when leaving the final grid row', () => {
    const { content, navigate } = createGrid();
    const action = document.createElement('button');
    action.dataset.dropdownItem = '';
    content.append(action);

    expect(navigate({ key: 'ArrowDown', from: 6 })).toBe(action);
  });

  it('places a nested section in a single cell and leaves its items to linear navigation', () => {
    const content = document.createElement('div');
    content.dataset.dropdownContent = '';
    const section = document.createElement('div');
    section.dataset.dropdownColumns = '3';
    const first = createCell('A');
    const second = createCell('B');
    const nestedFirst = createCell('C1');
    const nestedSecond = createCell('C2');
    const fourth = createCell('D');
    const fifth = createCell('E');
    const nestedSection = document.createElement('div');
    nestedSection.append(nestedFirst, nestedSecond);
    section.append(first, second, nestedSection, fourth, fifth);
    content.append(section);
    const items = getDropdownItems(content);
    const navigate = (key: string, from: HTMLElement) =>
      getNextDropdownItem({
        key,
        items,
        currentIndex: items.indexOf(from),
        search: null,
        isSearch: false,
      });

    expect(navigate('ArrowDown', first)).toBe(fourth);
    expect(navigate('ArrowUp', fourth)).toBe(first);
    expect(navigate('ArrowDown', second)).toBe(fifth);
    expect(navigate('ArrowDown', nestedFirst)).toBe(nestedSecond);
  });

  it('uses linear navigation when the column count is not a positive integer', () => {
    const { cells, navigate } = createGrid({ columns: '2.5' });

    expect(navigate({ key: 'ArrowDown', from: 0 })).toBe(cells[1]);
    expect(navigate({ key: 'ArrowRight', from: 0 })).toBeUndefined();
  });
});
