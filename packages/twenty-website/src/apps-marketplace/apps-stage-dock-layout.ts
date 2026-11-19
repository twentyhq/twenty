// PROTOTYPE (?direction=d): geometry of the hero's logo dock, in tile units.
// One function serves the server render and the pointer-driven updates, so
// the first paint is already the composed arrangement.
export type AppsStageDockSlot = {
  // centre offset from the dock's middle
  x: number;
  // bottom offset from the baseline (negative rises)
  y: number;
  scale: number;
  // 0 (far, soft) to 1 (in focus, sharp)
  focus: number;
};

const FOCUS_SPREAD = 1.5;
const POINTER_SPREAD = 1.05;
const REST_SHARE_UNDER_POINTER = 0.78;
const SCALE_FAR = 0.56;
const SCALE_NEAR = 1.32;
const GAP = 0.2;
const RISE = 0.2;
const GRID_COLUMNS = 4;
const GRID_PITCH = 1.14;

const bell = (distance: number, spread: number): number =>
  Math.exp(-(distance ** 2) / (2 * spread ** 2));

// At rest the focus sits on the middle. A pointer adds a tighter focus of its
// own without collapsing the rest of the row: the composition holds.
const buildDockRow = (
  count: number,
  pointerIndex: number | null,
): AppsStageDockSlot[] => {
  const restIndex = (count - 1) / 2;
  const focuses = Array.from({ length: count }, (_, index) => {
    const rest = bell(index - restIndex, FOCUS_SPREAD);

    return pointerIndex === null
      ? rest
      : Math.max(
          rest * REST_SHARE_UNDER_POINTER,
          bell(index - pointerIndex, POINTER_SPREAD),
        );
  });
  const scales = focuses.map(
    (focus) => SCALE_FAR + (SCALE_NEAR - SCALE_FAR) * focus,
  );
  const totalWidth =
    scales.reduce((sum, scale) => sum + scale, 0) + GAP * (count - 1);

  let cursor = -totalWidth / 2;

  return scales.map((scale, index) => {
    const x = cursor + scale / 2;
    cursor += scale + GAP;

    return {
      x,
      y: -RISE * (1 - focuses[index]),
      scale,
      focus: focuses[index],
    };
  });
};

const widthOf = (slots: readonly AppsStageDockSlot[]): number => {
  const first = slots[0];
  const last = slots[slots.length - 1];

  return first === undefined || last === undefined
    ? 0
    : last.x + last.scale / 2 - (first.x - first.scale / 2);
};

// Small screens cannot hold one row of large logos: tidy rows of four.
const buildDockGrid = (count: number): AppsStageDockSlot[] => {
  const rowCount = Math.ceil(count / GRID_COLUMNS);

  return Array.from({ length: count }, (_, index) => {
    const row = Math.floor(index / GRID_COLUMNS);
    const rowLength = Math.min(GRID_COLUMNS, count - row * GRID_COLUMNS);
    const column = index - row * GRID_COLUMNS;

    return {
      x: (column - (rowLength - 1) / 2) * GRID_PITCH,
      y: -(rowCount - 1 - row) * GRID_PITCH,
      scale: 1,
      focus: 1,
    };
  });
};

export const appsStageDockLayout = {
  row: buildDockRow,
  grid: buildDockGrid,
  // widest the row ever gets, wherever the pointer is
  rowWidth: (count: number): number =>
    Math.max(
      widthOf(buildDockRow(count, null)),
      ...Array.from({ length: count }, (_, index) =>
        widthOf(buildDockRow(count, index)),
      ),
    ),
  gridRowCount: (count: number): number => Math.ceil(count / GRID_COLUMNS),
  gridPitch: GRID_PITCH,
};
