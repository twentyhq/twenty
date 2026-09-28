# Reading direction audit

This audit covers the retained Twenty UI surface on main as of 2026-09-28. Applications pair `TextDirectionProvider` with an HTML `dir` attribute. No new direction provider or public prop is introduced.

## Reading-direction changes

| Area | Behavior |
| --- | --- |
| Callout | Supporting text uses inline-start indentation. |
| JsonTree | Nested lists indent from inline-start. Collapsed disclosure arrows point toward inline-end; expanded arrows point down. |
| CardPicker | Text aligns to start. |
| ColorSchemePicker | Card spacing, inset content, borders, mixed-preview corners, and selection badge follow reading direction. |
| Button | The Soon badge consumes available space on its inline-start side. |
| ListItem, Menu, Dropdown | Only the built-in submenu chevron mirrors. Labels and descriptions retain truncation and logical alignment. |
| Menu, Popover, Tooltip | Positioners carry the Base UI provider direction across portals, including scoped themes. Dropdown inherits Popover behavior. |
| Dropdown | Submenu keyboard navigation reads the same provider as positioning. Back chooses the directional chevron. Header and back-row icons supplied by consumers are no longer all rotated. |
| AvatarGroup | `overlap` remains a physical left/right edge. The zero-margin outer item follows row direction, preserving internal overlap without an outside negative margin. |

## Intentional physical cases

| Occurrence | Reason |
| --- | --- |
| Popover and Tooltip arrow left/right offsets and side selectors | Coordinates describe the physical side selected by Base UI collision handling. Logical inline-start/inline-end placement remains available. |
| Menu, Popover, Tooltip, Select side types | Explicit left/right values are supported physical-placement APIs. |
| AvatarGroup left/right margins and overlap values | Public physical overlap contract, including callers that choose either edge. |
| Section `align="left"` | Explicit physical alignment API. It is not relabeled as start. |
| CodeEditorHeader leftNodes/rightNodes and top corner radii | Existing editor slots and symmetric top corners are preserved. Monaco remains optional and isolated. |
| CodeEditor bottom corner shorthand, Dropdown bottom-left/bottom-right resets | Both corners on the same block edge have identical values. Mirroring cannot change the result. |
| Tabs `--active-tab-left`/`--active-tab-right` | Base UI measured coordinates, already selected by direction and applied through logical offsets. |
| Loader translateX and circular loader/orbit rotations | Decorative motion, not navigation or reading order. |
| Checkbox, Radio, popup and toast scale/translate animations | State feedback, centering, and block-axis movement, not reading direction. |
| Caller-provided icons, checkmarks, close icons, vertical chevrons | Meaning does not change with reading direction. |

Other retained spacing, borders, corner radii, truncation, and row order use logical properties, symmetric shorthands, or direction-aware flex/grid layout. ButtonGroup, Tabs, Switch, Slider, SegmentedControl, ResizeHandle, Select, Dialog, AlertDialog, and Toaster already use logical layout or Base UI direction contracts.

## Migration boundaries

Legacy MenuItem, MenuItemAvatar, MenuItemDraggable, MenuItemSuggestion, and MenuPicker still appear in current exports and consumers. Their physical contextual-text spacing, trailing-action positions, and legacy submenu rotation remain with the separate Dropdown consumer migration. They are not evidence of completed RTL support. The retained Menu/ListItem/Dropdown implementations are covered here. Settings migration #26794 is still open; this change does not take it over.

The label work (#26804) overlaps ColorSchemeCard.tsx and DropdownSubmenuTrigger.tsx. Preserve both its label passthrough and these direction changes when integrating. Documentation coverage #26791 was open during implementation; retain its existing story IDs and the separate presentational direction preview. The final cleanup audit must run on the integrated revision.

Pinned packages/twenty-apps do not receive these fixes until their separately coordinated source and dependency upgrades. In particular, call-recorder and Granola still require the documented theme-provider migration when upgrading. No app dependency or source is changed here.

## Verification and compatibility

Native presentational previews show light/dark and LTR/RTL together. Separate play stories cover grouped corners and order, avatar overlap, truncation, JSON disclosure, picker selection, directional keys, submenu placement, pointer selection, page navigation, caller icon orientation, and scoped/body portals.

Both package builds explicitly use the existing esbuild CSS minifier. The default Lightning CSS minifier lowered `:dir()` into a language-based approximation, which broke arrows and overlap when `dir` differed from the document language. The renderer fixtures test the built CSS with both directions on the same page.

The renderer previously forwarded `dir` only for `bdo`. It now forwards the global HTML attribute on all elements through the owning schema/generator. This is necessary for both logical CSS and direction-sensitive selectors; CSS-variable themes remain provider-less in the fixtures.

The native regression run passed 71 stories. The initial renderer run produced 2 passing layout cases and 8 failing compatibility probes. The final supported run passed all 4 React/Preact light/dark layout cases:

| Renderer case | React | Preact |
| --- | --- | --- |
| Reading-direction layout, selected theme badge, submenu chevron, avatar overlap, JSON disclosure | Pass | Pass |
| CardPicker/SegmentedControl | Cannot mount: missing `compareDocumentPosition` | Directional selection fails; worker `PointerEvent` construction is unavailable |
| Menu submenu | Popup does not open | Popup does not open |
| Dropdown submenu | Popup does not open | Popup does not open |
| Tooltip | Popup does not appear | Popup does not appear |

The eight failing probes retain their intended success assertions and are explicitly tagged `renderer-unsupported` and `!test`. Opening them in Storybook runs their play functions for manual retesting. They are unresolved compatibility limitations, not passing support. Repairing worker DOM/event support and general popup geometry belongs to the separate renderer workstream. Existing expected-failure gallery cases do not establish compatibility.

Native preview accessibility checks defer only the existing low-contrast design tokens through the established `A11Y_DEFER_COLOR_CONTRAST` setting. This change does not adjust colors.
