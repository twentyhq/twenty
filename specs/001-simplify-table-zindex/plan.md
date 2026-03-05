# Implementation Plan: Simplify RecordTable Z-Index Logic

**Branch**: `001-simplify-table-zindex` | **Date**: 2026-03-05 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-simplify-table-zindex/spec.md`

## Summary

The RecordTable hover and focus portals currently use complex scroll-dependent z-index switching logic (4 scroll states × 3 column types × 2 group modes = 24 branches per portal). The fix is to make portal overlays 1px smaller so they fit entirely inside the cell boundary, allowing CSS stacking contexts from `position: sticky` to naturally handle layering. This eliminates the need for dynamic z-index recalculation and drastically simplifies the TABLE_Z_INDEX constant.

## Technical Context

**Language/Version**: TypeScript 5.x, React 18
**Primary Dependencies**: React, Linaria (CSS-in-JS), Jotai (state management)
**Storage**: N/A (client-side refactor only)
**Testing**: Manual visual testing (4 scroll states × 2 group modes matrix)
**Target Platform**: Web browser (Chrome, Firefox, Safari)
**Project Type**: Monorepo package (twenty-front)
**Performance Goals**: No performance regression; reduced re-renders from eliminating scroll-triggered state updates
**Constraints**: Must be done incrementally with visual verification at each step
**Scale/Scope**: ~13 files modified, ~500 lines of code removed/simplified

## Project Structure

### Documentation (this feature)

```text
specs/001-simplify-table-zindex/
├── plan.md              # This file
├── spec.md              # Feature specification
├── checklists/          # Quality checklists
└── tasks.md             # Task breakdown (generated separately)
```

### Source Code (files to modify)

```text
packages/twenty-front/src/modules/object-record/record-table/
├── constants/
│   └── TableZIndex.ts                          # SIMPLIFY: Remove scroll-dependent sections
├── components/
│   ├── RecordTableScrollAndZIndexEffect.tsx     # SIMPLIFY: Remove z-index atom updates
│   └── RecordTableStyleWrapper.tsx              # REVIEW: May need z-index adjustments
├── record-table-cell/components/
│   ├── RecordTableCellHoveredPortal.tsx         # SIMPLIFY: Use static z-index
│   ├── RecordTableCellFocusedPortal.tsx         # SIMPLIFY: Use static z-index
│   ├── RecordTableCellPortalRootContainer.tsx   # MODIFY: Add 1px inset sizing
│   ├── RecordTableCellHoveredPortalContent.tsx  # REVIEW: May need height adjustment
│   ├── RecordTableCellEditModePortal.tsx        # REVIEW: Should remain unchanged
│   ├── RecordTableCellBaseContainer.tsx         # REVIEW: Positioning context
│   └── RecordTableCellFirstRowFirstColumn.tsx   # SIMPLIFY: Remove scroll-dependent z-index
├── record-table-header/components/
│   └── RecordTableHeaderFirstScrollableCell.tsx # REVIEW: firstScrollableHeaderCell z-index
├── record-table-row/components/
│   └── RecordTableRowDiv.tsx                    # REVIEW: activeRows z-index (secondary)
├── record-table-footer/components/
│   ├── RecordTableAggregateFooter.tsx           # REVIEW: Footer z-index unaffected
│   └── RecordTableAggregateFooterCell.tsx       # REVIEW: Footer z-index unaffected
└── states/
    ├── isRecordTableScrolledVerticallyComponentState.ts    # REVIEW: May still be needed for shadows
    └── isRecordTableScrolledHorizontallyComponentState.ts  # REVIEW: May still be needed for shadows
```

## Key Technical Decisions

### 1. Portal Sizing Strategy (Core Fix)

The `RecordTableCellPortalRootContainer` currently uses `width: 100%; height: 100%; top: 0; left: 0`. By changing to `top: 1px; left: 1px; width: calc(100% - 2px); height: calc(100% - 1px)` (1px inset on top, left, right; the bottom border is shared), the overlay stays inside the cell boundary.

This means the portal no longer extends beyond the cell's `position: relative` container and therefore:
- Does NOT overlap adjacent cell borders
- Naturally goes UNDER sticky elements that overlap the cell (header, sticky column)
- Naturally stays ABOVE sibling cells within the same stacking context

### 2. Z-Index Simplification

Once portals are inset, the hover/focus z-index only needs to be higher than the cell's default content but lower than edit mode. A single static value suffices.

**Before**: 24+ dynamic z-index values per portal
**After**: 1 static z-index value per portal type (hover, focus, edit)

### 3. Scroll State Atoms

The `isRecordTableScrolledVertically` and `isRecordTableScrolledHorizontally` atoms are still needed for:
- Scroll shadow CSS visibility
- Mobile first-column compaction
- Active row z-index on first row (secondary concern, can be addressed separately)

They will NOT be removed, but portal components will stop consuming them.

### 4. Incremental Approach

Each step must be independently verifiable:
1. First: Inset the portal sizing → verify hover looks correct
2. Then: Replace dynamic z-index with static value in hover portal → verify
3. Then: Do the same for focus portal → verify
4. Then: Simplify TABLE_Z_INDEX constant → verify
5. Finally: Clean up dead code (unused atom consumers, unused constant sections)

## Complexity Tracking

No constitution violations. This is a simplification refactor that reduces complexity.
