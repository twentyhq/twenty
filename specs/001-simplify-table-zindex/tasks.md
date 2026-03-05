# Tasks: Simplify RecordTable Z-Index Logic

**Input**: Design documents from `/specs/001-simplify-table-zindex/`
**Prerequisites**: plan.md, spec.md

**Tests**: No automated tests requested. Each phase requires **manual visual testing** across a 4×2 matrix (4 scroll states × with/without record groups).

**Organization**: Tasks follow the incremental approach from the spec (FR-010): each phase is independently verifiable before proceeding to the next.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Visual Test Matrix

Every checkpoint requires testing these 8 scenarios:

| # | Groups | Scroll State | Key Verification |
|---|--------|-------------|------------------|
| 1 | No  | No scroll | Hover appears inside cell, above sibling cells |
| 2 | No  | Vertical only | Hover does not overlap sticky header |
| 3 | No  | Horizontal only | Hover on sticky col stays above scrolled cells |
| 4 | No  | Both | Hover correct at sticky column/header intersection |
| 5 | Yes | No scroll | Hover correct near group section headers |
| 6 | Yes | Vertical only | Hover does not overlap sticky header or group header |
| 7 | Yes | Horizontal only | Hover on sticky col correct with groups |
| 8 | Yes | Both | All layers correct |

---

## Phase 1: Setup

**Purpose**: No project setup needed — this is a refactor within the existing twenty-front package.

- [ ] T001 Create a working branch from main and verify the dev server starts with `npx nx start twenty-front`

---

## Phase 2: Foundational — Portal Sizing Fix (Core Change)

**Purpose**: Make portal overlays 1px smaller so they fit inside the cell boundary. This is the **single change** that enables all subsequent simplification. MUST be verified before proceeding.

**Why this is blocking**: If the portal sizing doesn't solve the layering problem, the entire z-index simplification approach fails and we need a different strategy.

- [X] T002 [US1] [US2] [US3] Modify portal root container to use 1px inset positioning in `packages/twenty-front/src/modules/object-record/record-table/record-table-cell/components/RecordTableCellPortalRootContainer.tsx` — change from `top: 0; left: 0; width: 100%; height: 100%` to `top: 1px; left: 1px; width: calc(100% - 2px); height: calc(100% - 1px)` (1px inset on top/left/right, flush at bottom since rows share a bottom border)

**Checkpoint**: Run the full visual test matrix. The hover indicator should now appear 1px inside the cell boundary on all sides. Verify:
- Hover on normal cells does not overlap adjacent borders (US1)
- Hover on sticky first column does not peek into the second column (US2)
- Hover on first data row does not overlap the header (US3)
- Edit mode still works (US5)
- Focus indicator still works (US5)
- All 8 matrix scenarios pass

---

## Phase 3: User Story 1 + 2 + 3 — Simplify Hover Portal Z-Index (Priority: P1)

**Goal**: Replace the 120-line scroll-dependent z-index computation in the hover portal with a single static z-index value. With the portal now inset inside the cell, a static z-index is sufficient.

**Independent Test**: Hover over all cell types (normal, sticky column, near header) in all scroll states. The hover indicator should display correctly without any scroll-dependent z-index switching.

- [ ] T003 [US1] [US2] [US3] Simplify `RecordTableCellHoveredPortal` in `packages/twenty-front/src/modules/object-record/record-table/record-table-cell/components/RecordTableCellHoveredPortal.tsx` — remove all scroll state reads (`isRecordTableScrolledVertically`, `isRecordTableScrolledHorizontally`), remove the `hasRecordGroups` read, remove all conditional z-index computation (~90 lines), and replace with a single static z-index value (use the cell's default z-index + 1, e.g., `4`). Remove imports of `isRecordTableScrolledVerticallyComponentState`, `isRecordTableScrolledHorizontallyComponentState`, `hasRecordGroupsComponentSelector`, and `TABLE_Z_INDEX`

**Checkpoint**: Run the full visual test matrix. Hover should work identically to after Phase 2. If any scenario fails, the static z-index value needs adjustment.

---

## Phase 4: User Story 1 + 2 + 3 — Simplify Focus Portal Z-Index (Priority: P1)

**Goal**: Apply the same simplification to the focus portal.

**Independent Test**: Click cells to focus them in all scroll states. The focus indicator should display correctly.

- [ ] T004 [US1] [US2] [US3] Simplify `RecordTableCellFocusedPortal` in `packages/twenty-front/src/modules/object-record/record-table/record-table-cell/components/RecordTableCellFocusedPortal.tsx` — same changes as T003: remove all scroll state reads, remove `hasRecordGroups` read, remove all conditional z-index computation (~90 lines), replace with the same static z-index value used in the hover portal. Keep the `isUnderHoveredPortal` check (still needed). Remove unused imports

**Checkpoint**: Run the full visual test matrix. Focus should work identically. Test focus + hover simultaneously (hover one cell, focus another).

---

## Phase 5: User Story 4 — Verify Record Groups (Priority: P2)

**Goal**: Confirm the simplified portals work correctly in grouped tables.

**Independent Test**: Enable record groups, scroll through groups, hover and focus cells near group boundaries.

- [ ] T005 [US4] Verify hover and focus portals display correctly in grouped record tables — test all 4 group-specific scenarios from the visual test matrix (scenarios 5-8). If any issue, adjust the static z-index value in both portal components

**Checkpoint**: All 8 visual test matrix scenarios pass.

---

## Phase 6: User Story 5 — Verify Non-Regression of Adjacent Features (Priority: P2)

**Goal**: Confirm edit mode, focus, drag-and-drop, and footer are unaffected.

- [ ] T006 [US5] Verify edit mode still works — click a cell, enter edit mode, confirm the edit overlay appears above the hover indicator. Check `RecordTableCellEditModePortal` in `packages/twenty-front/src/modules/object-record/record-table/record-table-cell/components/RecordTableCellEditModePortal.tsx` still uses z-index 30 (should be unchanged)
- [ ] T007 [P] [US5] Verify column drag-and-drop — drag column grips to reorder columns. Confirm drag handles and clone appear above all table elements. Check `RecordTableCellDragAndDrop` still uses z-index 30
- [ ] T008 [P] [US5] Verify footer aggregate row — scroll to the bottom of a table with aggregates. Confirm footer cells display correctly and are not overlapped by hover portals from data rows

**Checkpoint**: All adjacent features work correctly. No regression.

---

## Phase 7: User Story 6 — Simplify TABLE_Z_INDEX Constant (Priority: P3)

**Goal**: Remove all scroll-state-dependent sections from the TABLE_Z_INDEX constant and simplify it to static values only.

- [ ] T009 [US6] Remove the `withGroups` scroll-state section (containing `noScrollAtAll`, `scrolledBothVerticallyAndHorizontally`, `scrolledHorizontallyOnly`, `scrolledVerticallyOnly`) from `packages/twenty-front/src/modules/object-record/record-table/constants/TableZIndex.ts`
- [ ] T010 [P] [US6] Remove the `withoutGroups` scroll-state section (same 4 sub-keys) from `packages/twenty-front/src/modules/object-record/record-table/constants/TableZIndex.ts`
- [ ] T011 [US6] Add a new static `hoverPortal` z-index entry to TABLE_Z_INDEX to replace the removed scroll-dependent values. Update `RecordTableCellHoveredPortal` and `RecordTableCellFocusedPortal` to reference `TABLE_Z_INDEX.hoverPortal` instead of a hardcoded number
- [ ] T012 [US6] Simplify `RecordTableCellFirstRowFirstColumn` in `packages/twenty-front/src/modules/object-record/record-table/record-table-cell/components/RecordTableCellFirstRowFirstColumn.tsx` — remove the scroll-dependent z-index logic for cell(0,0). Since the portal now fits inside the cell, cell(0,0) no longer needs a special elevated z-index when hovered. Use a single static z-index. Remove the `withoutGroupsCell0_0` section from TABLE_Z_INDEX
- [ ] T013 [US6] Simplify `RecordTableHeaderFirstScrollableCell` in `packages/twenty-front/src/modules/object-record/record-table/record-table-header/components/RecordTableHeaderFirstScrollableCell.tsx` — remove scroll-dependent z-index computation for `firstScrollableHeaderCell`. Use a single static z-index from the headerColumns section. Remove unused scroll-state imports

**Checkpoint**: TABLE_Z_INDEX should now be ~25-30 lines. Run the full visual test matrix one final time.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Clean up dead code and verify final state.

- [ ] T014 [P] Remove unused imports of `isRecordTableScrolledVerticallyComponentState` and `isRecordTableScrolledHorizontallyComponentState` from `RecordTableCellFirstRowFirstColumn.tsx` and any other files that no longer need them
- [ ] T015 [P] Verify `RecordTableScrollAndZIndexEffect` in `packages/twenty-front/src/modules/object-record/record-table/components/RecordTableScrollAndZIndexEffect.tsx` still works correctly — it should continue to manage scroll shadow CSS variables and mobile compaction. Confirm it still sets the scroll atoms (other header components still consume them for border-bottom visibility)
- [ ] T016 Run `npx nx lint:diff-with-main twenty-front` and `npx nx typecheck twenty-front` to verify no lint or type errors
- [ ] T017 Run the final comprehensive visual test matrix across all 8 scenarios. Verify all 6 user stories pass
- [ ] T018 Verify the final TABLE_Z_INDEX constant is under 30 lines and all values are static (no scroll-state keys remain)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies
- **Phase 2 (Portal Sizing)**: Depends on Phase 1 — **BLOCKS everything else**. This is the critical validation step.
- **Phase 3 (Hover Simplification)**: Depends on Phase 2 passing visual tests
- **Phase 4 (Focus Simplification)**: Depends on Phase 3 passing visual tests
- **Phase 5 (Groups Verification)**: Depends on Phase 4
- **Phase 6 (Non-Regression)**: Depends on Phase 4. Can run in parallel with Phase 5
- **Phase 7 (TABLE_Z_INDEX Cleanup)**: Depends on Phase 5 and Phase 6 both passing
- **Phase 8 (Polish)**: Depends on Phase 7

### Critical Path

```
T001 → T002 → T003 → T004 → T005 → T009/T010/T011/T012/T013 → T014-T018
                                  ↘ T006/T007/T008 ↗
```

### Parallel Opportunities

- T007 and T008 can run in parallel (different verification scopes)
- T009 and T010 can run in parallel (different sections of the same constant)
- T014 and T015 can run in parallel (different cleanup targets)

---

## Implementation Strategy

### MVP First (Phase 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Portal sizing fix
3. **STOP and VALIDATE**: Full visual test matrix
4. If Phase 2 passes → proceed to simplification
5. If Phase 2 fails → the 1px inset approach needs adjustment before proceeding

### Incremental Delivery

1. Phase 2: Portal sizing fix → **Validate** (core hypothesis test)
2. Phase 3: Hover portal simplified → **Validate** (first simplification win)
3. Phase 4: Focus portal simplified → **Validate** (symmetric change)
4. Phase 5 + 6: Groups + non-regression → **Validate** (full coverage confirmed)
5. Phase 7: TABLE_Z_INDEX cleanup → **Validate** (maintainability goal achieved)
6. Phase 8: Polish → **Final validation** (production-ready)

Each phase delivers value independently. If any phase reveals issues, we can stop at the previous known-good state.

---

## Notes

- No [P] parallelism markers on most tasks because this is a sequential refactor where each step depends on visual verification of the previous step
- The scroll state atoms (`isRecordTableScrolledVertically/Horizontally`) are NOT deleted — they are still consumed by header components for border-bottom visibility, scroll shadows, and mobile compaction
- The `activeRows` z-index logic in `RecordTableRowDiv` is OUT OF SCOPE per the clarification decision (portal z-index only; activeRows can be addressed in a follow-up)
- Commit after each phase checkpoint passes
