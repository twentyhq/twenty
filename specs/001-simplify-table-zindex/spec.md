# Feature Specification: Simplify RecordTable Z-Index Logic

**Feature Branch**: `001-simplify-table-zindex`
**Created**: 2026-03-05
**Status**: Draft
**Input**: User description: "Refactor RecordTable z-index logic by making hovered portal 1px smaller to fit inside cell container, eliminating complex z-index switching on scroll events, and simplify TABLE_Z_INDEX constant"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Hover indicator displays correctly on normal (non-sticky) cells (Priority: P1)

A user browsing the record table hovers over any cell that is not in a sticky row or column. A visual hover indicator (outline, background highlight) appears cleanly within the cell boundaries, without overlapping neighboring cells' borders.

**Why this priority**: This is the most common interaction — the vast majority of cells are non-sticky. If hover works here, the core approach is validated.

**Independent Test**: Open a record table with enough rows and columns to scroll. Hover over various cells in non-sticky rows and columns. Verify the hover indicator appears inside the cell and does not bleed into neighbors.

**Acceptance Scenarios**:

1. **Given** a record table with multiple rows and columns, **When** the user hovers over a non-sticky cell in a non-scrolled table, **Then** the hover indicator appears fully within that cell's boundaries and does not visually overlap adjacent cell borders.
2. **Given** a record table scrolled both horizontally and vertically, **When** the user hovers over a visible non-sticky cell, **Then** the hover indicator appears correctly inside the cell without flickering or z-index conflicts.
3. **Given** the user moves the mouse from one non-sticky cell to another, **When** the hover transitions, **Then** the old indicator disappears and the new one appears cleanly with no visual artifacts.

---

### User Story 2 — Hover indicator displays correctly on sticky first column cells (Priority: P1)

A user hovers over a cell in the first column (label identifier), which remains sticky when scrolling horizontally. The hover indicator appears inside the cell and remains visually correct whether the table is scrolled or not.

**Why this priority**: The sticky first column is always visible and a primary interaction target. If the hover portal incorrectly overlaps or underlaps the sticky boundary, it creates a jarring visual experience.

**Independent Test**: Open a record table with horizontal overflow. Scroll horizontally so the first column is sticky. Hover over cells in the first column. Verify the hover indicator stays within the first column cell and does not peek behind or in front of scrolled content.

**Acceptance Scenarios**:

1. **Given** a record table not scrolled horizontally, **When** the user hovers a cell in the first column, **Then** the hover indicator displays inside the cell without overlapping the second column.
2. **Given** a record table scrolled horizontally, **When** the user hovers a cell in the sticky first column, **Then** the hover indicator displays inside the cell and non-sticky cells scrolling behind the first column do not show through the hover indicator.
3. **Given** a record table scrolled both horizontally and vertically, **When** hovering a first-column cell, **Then** the hover indicator remains correctly inside the cell.

---

### User Story 3 — Hover indicator displays correctly on header row cells (Priority: P1)

A user hovers near or on the first data row directly below the sticky header. The hover indicator does not visually overlap or peek above the header row.

**Why this priority**: The header is sticky and always visible. If the hover portal extends beyond the cell boundary, it could overlap header content.

**Independent Test**: Open a record table with vertical overflow. Scroll vertically so the header is sticky. Hover over cells in the first visible data row. Verify the hover indicator does not overlap the header.

**Acceptance Scenarios**:

1. **Given** a record table scrolled vertically, **When** the user hovers a cell in the first visible row below the sticky header, **Then** the hover indicator stays inside the cell and does not overlap any part of the header row.
2. **Given** a table not scrolled at all, **When** the user hovers a cell in the first data row, **Then** the hover indicator displays inside the cell without peeking above into the header.

---

### User Story 4 — Hover indicator displays correctly in tables with record groups (Priority: P2)

A user views a record table organized by record groups (grouped records). Hovering over cells within any group shows the hover indicator correctly inside the cell, including cells near group section headers.

**Why this priority**: Record groups add additional sticky elements (group headers). The simplified approach must work with these extra layers, but this is a secondary configuration.

**Independent Test**: Open a record table with record groups enabled. Hover over cells near group section boundaries. Verify hover indicators stay inside cells and do not overlap group headers.

**Acceptance Scenarios**:

1. **Given** a grouped record table, **When** hovering a cell in the first row of a group, **Then** the hover indicator displays inside the cell without overlapping the group section header.
2. **Given** a grouped record table scrolled vertically, **When** hovering cells in visible groups, **Then** the hover indicator behaves correctly regardless of which group the cell belongs to.

---

### User Story 5 — Edit mode, focus, and drag interactions remain unaffected (Priority: P2)

Existing interactions — clicking a cell to focus it, entering edit mode, and column drag-and-drop — continue to work correctly after the refactor.

**Why this priority**: These are adjacent features that share the z-index layering system. They must not regress.

**Independent Test**: Click a cell to focus it, then enter edit mode. Drag a column to reorder. Verify all interactions behave as before the refactor.

**Acceptance Scenarios**:

1. **Given** a record table, **When** the user clicks a cell, **Then** the cell enters focus state with the correct visual indicator.
2. **Given** a focused cell, **When** the user triggers edit mode, **Then** the edit mode overlay appears above all other layers including hover indicators.
3. **Given** a record table, **When** the user drags a column grip to reorder, **Then** the drag handle and clone appear above all other table elements.

---

### User Story 6 — Scroll-dependent z-index switching logic is removed (Priority: P3)

After the refactor, the table no longer dynamically recalculates z-index values based on scroll position for hover portals. The TABLE_Z_INDEX constant is simplified to contain only static values.

**Why this priority**: This is the maintainability goal — removing complexity. It is testable by code review and confirming all visual scenarios above pass without dynamic z-index logic.

**Independent Test**: Inspect the codebase: confirm TABLE_Z_INDEX no longer contains scroll-state-dependent sections. Confirm scroll event handlers no longer set z-index-related state for hover portals.

**Acceptance Scenarios**:

1. **Given** the refactored codebase, **When** inspecting TABLE_Z_INDEX, **Then** it contains no scroll-state-dependent z-index values (no sections like `noScrollAtAll`, `scrolledVerticallyOnly`, etc.).
2. **Given** the refactored codebase, **When** inspecting the scroll effect component, **Then** it no longer sets boolean atoms consumed exclusively for hover/focus portal z-index computation.
3. **Given** the refactored codebase, **When** inspecting hover and focus portal components, **Then** they use a single static z-index value rather than computing z-index from scroll state.

---

### Edge Cases

- What happens when hovering the cell at position (0, 0) — the intersection of the sticky first column and sticky header row? The hover indicator must stay within the cell and not overlap the header or extend beyond the first column boundary.
- What happens when a cell is both hovered and the table is being scrolled simultaneously? The hover indicator must remain inside the cell during scroll without visual glitching.
- What happens when the table has only one column (no horizontal scroll possible)? The hover indicator should still display correctly.
- What happens when the table has only one row (no vertical scroll possible)? The hover indicator should still display correctly.
- What happens with the footer aggregate row? The hover indicator on cells near the footer must not overlap footer content.
- What happens with very narrow columns? The 1px size reduction should still leave sufficient visible area for the hover indicator.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The hover portal overlay MUST be rendered 1px smaller than the cell container on all sides (or configured such that it fits entirely inside the cell boundary without overlapping neighboring cells' borders).
- **FR-002**: The hover portal MUST display above sibling non-sticky cells regardless of scroll position, without dynamic z-index recalculation.
- **FR-003**: The hover portal on a non-sticky cell MUST display below sticky column cells and sticky header cells when those sticky elements overlap due to scrolling.
- **FR-004**: The hover portal on a sticky first-column cell MUST display above non-sticky cells that scroll behind it.
- **FR-005**: The edit mode overlay MUST continue to display above all other table layers, including hover and focus portals.
- **FR-006**: The column drag grip MUST continue to display above all other table layers.
- **FR-007**: The TABLE_Z_INDEX constant MUST be simplified to remove all scroll-state-dependent sections (`noScrollAtAll`, `scrolledBothVerticallyAndHorizontally`, `scrolledHorizontallyOnly`, `scrolledVerticallyOnly`).
- **FR-008**: The focus portal MUST follow the same sizing and z-index simplification as the hover portal.
- **FR-009**: The footer row z-index layering MUST remain correct — footer cells must not be overlapped by hover portals from data rows.
- **FR-010**: The refactor MUST be done in incremental steps, with each step visually tested before proceeding to the next, to prevent regressions.

## Assumptions

- The 1px size reduction approach (making the portal fit inside the cell boundary) is sufficient to prevent border overlap in all cases, eliminating the need for scroll-dependent z-index switching.
- The existing stacking context created by sticky positioning (columns and header) will naturally handle the layering once the portal no longer extends beyond the cell boundary.
- The `position: absolute` portal root container already constrains the portal within the cell's stacking context, so shrinking it by 1px will keep it visually correct.
- Active row highlight z-index logic (which also varies by scroll state) can be simplified following the same principle, but is a secondary concern.
- The change to portal sizing should not affect the click/focus target area in any user-perceptible way.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 6 user stories pass manual visual testing across the 4 scroll states (no scroll, vertical only, horizontal only, both) in tables with and without record groups.
- **SC-002**: The TABLE_Z_INDEX constant is reduced from ~120 lines to under 30 lines.
- **SC-003**: The hover and focus portal components no longer read scroll-position state — their z-index is static.
- **SC-004**: No visual regression in edit mode, column drag-and-drop, footer aggregates, or group section headers.
- **SC-005**: The scroll effect component no longer manages z-index-related boolean atoms (or those atoms are removed entirely if no other consumers remain).
- **SC-006**: Developers can understand the table's z-index layering by reading the simplified TABLE_Z_INDEX constant without needing to trace scroll-state branches.
