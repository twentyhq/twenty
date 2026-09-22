# Breaking module ownership migration

This change removes the previous exports immediately. Release it as a breaking package change and migrate applications together with the library. The package now exposes 42 primitives and 32 shared React components, including the optional code editor.

The sections below describe the current implementation. The [remaining migration plan](#remaining-migration-plan) records the proposed next steps separately.

## Choosing a module

- A primitive owns one foundational interaction or presentation contract. It may compose other primitives to fulfill that contract. Examples include Button, Field, ListItem, Dialog, Text, and Avatar.
- A shared component combines primitives into a reusable presentation or interaction. It receives data, translated labels, callbacks, and render props from its host. It does not own application routing, record metadata, or application state.
- A frontend adapter owns product policy such as routing, field formatting, click-outside coordination, and empty-state illustrations. Feature-specific presentation stays with its feature.
- An implementation part stays private to the module that uses it. Import the owner and use its public parts or slots.

## Public imports

Foundational controls keep their `twenty-ui/primitives/<family>` imports. Import shared components and their public types from `twenty-ui/components`. The code editor keeps `twenty-ui/components/code-editor`. The `twenty-ui/primitives/json-visualizer` entry point is removed. Root imports still expose the supported public interface.

Source folders group shared components by `data-display`, `feedback`, `input`, `layout`, and `navigation`, matching the primitive families. The optional `code-editor` folder remains separate. These folders organize the implementation; public imports use `twenty-ui/components` or `twenty-ui/components/code-editor`.

### Primitives

`VisibilityHidden`, `Avatar`, `Chip`, `ColorSample`, `Status`, `Tag`, `Banner`, `CircularProgressBar`, `Loader`, `ProgressBar`, `Button`, `ButtonGroup`, `Checkbox`, `Field`, `Input`, `InputGroup`, `Radio`, `RadioGroup`, `SegmentedControl`, `Select`, `Slider`, `Switch`, `Textarea`, `AnimatedExpandableContainer`, `HorizontalSeparator`, `ResizeHandle`, `TextDirectionProvider`, `ClickToActionLink`, `ListItem`, `Tabs`, `AlertDialog`, `Card`, `CardContent`, `CardFooter`, `CardHeader`, `Dialog`, `Menu`, `Popover`, `Tooltip`, `Heading`, `OverflowingTextWithTooltip`, `Text`.

### Shared components

`CodeEditor`, `CodeEditorHeader`, `IconButton`, `LightButton`, `MainButton`, `Section`, `SettingsRow`, `TabButton`, `AvatarGroup`, `CommandBlock`, `NotificationCounter`, `Pill`, `TintedIconTile`, `Callout`, `Info`, `InlineBanner`, `Toast`, `ToastProvider`, `Toaster`, `CardPicker`, `ColorSchemePicker`, `LightIconButton`, `SearchInput`, `JsonTree`, `AnimatedIconCrossfade`, `MenuItem`, `MenuItemAvatar`, `MenuItemDraggable`, `MenuItemSuggestion`, `MenuPicker`, `NavigationBar`, `RoundedLink`.

## Interface changes

- `OverflowingTextWithTooltip` stays a typography primitive: it owns truncation and overflow disclosure. ListItem, Chip, and Tag use it directly, and its implementation and private linkification helper live beside it.
- `JsonTree` accepts either `value` or `entries: { id, label, value }[]`. Entry IDs determine highlighting paths; labels determine presentation. Its default expansion opens the first two levels. Use `shouldExpandNodeInitially` to override that policy. Node renderers, context, and traversal helpers are private.
- Replace custom menu-row assemblies with `ListItem` slots and native role/selection props. `actionsVisibility` preserves either persistent or hover/focus actions. Styled menu fragments are private.
- `Info` accepts `href` and `render` instead of `to`. Supply a router link through `render` when client-side navigation is required. React Router is an optional peer used only by testing decorators.
- `AnimatedEaseInOut` is removed. Use `AnimatedExpandableContainer` with `isExpanded`, `duration`, and `containAnimation={false}` for its former frontend use cases.
- Toasts, their provider, toaster, and public hooks move to `twenty-ui/components`. Application localization, stacking, and click-outside behavior stay in the frontend toast adapter.
- Field displays, navigation links, application placeholders, and feature animation no longer have package exports. Frontend callers import their owning modules directly.
- Frontend empty-state layout uses `EmptyState.Root`, `.Content`, `.Title`, and `.Description`; error layout uses the corresponding `ErrorState` parts.
- Number fields render their formatted value with `Text`; command-menu edit actions use `Button`. Generic label consumers use locally styled `Text`. Legacy field-label, hint, avatar/icon, and ellipsis adapters remain private to frontend callers that still need their existing presentation contracts.

## Removed public components

The table records every removed React export. Internal implementation files are not supported imports for external consumers.

| Previous export                         | Replacement or owner                                                                          |
| --------------------------------------- | --------------------------------------------------------------------------------------------- |
| `VisibilityHiddenInput`                 | Removed unused implementation. Use the owning form primitive.                                 |
| `AnimatedCheckmark`                     | Frontend ui/navigation/step-bar/components/internal/AnimatedCheckmark.                        |
| `AvatarOrIcon`                          | Frontend field display adapter; compose Avatar for standalone use.                            |
| `Checkmark`                             | ColorSchemePicker internal indicator                                                          |
| `EllipsisDisplay`                       | Text with truncate; frontend field display adapter preserves legacy field sizing.             |
| `JsonDisplay`                           | Frontend ui/field/display/components/JsonDisplay.                                             |
| `LinkChip`                              | ui/navigation, router-chip adapter                                                            |
| `NumberDisplay`                         | NumberFieldDisplay renders its formatted value with Text.                                     |
| `SelectDisplay`                         | ui/field/display                                                                              |
| `StyledTintedIconTileContainer`         | TintedIconTile/internal                                                                       |
| `TextDisplay`                           | ui/field/display                                                                              |
| `AnimatedPlaceholder`                   | ui/feedback/empty-state, with feature wrappers                                                |
| `AnimatedPlaceholderEmptyContainer`     | Frontend EmptyState.Root.                                                                     |
| `AnimatedPlaceholderEmptyTextContainer` | Frontend EmptyState.Content.                                                                  |
| `AnimatedPlaceholderEmptyTitle`         | Frontend EmptyState.Title.                                                                    |
| `AnimatedPlaceholderEmptySubTitle`      | Frontend EmptyState.Description.                                                              |
| `AnimatedPlaceholderErrorContainer`     | Frontend ErrorState.Root.                                                                     |
| `AnimatedPlaceholderErrorTextContainer` | Frontend ErrorState.Content.                                                                  |
| `AnimatedPlaceholderErrorTitle`         | Frontend ErrorState.Title.                                                                    |
| `AnimatedPlaceholderErrorSubTitle`      | Frontend ErrorState.Description.                                                              |
| `SidePanelInformationBanner`            | Frontend side-panel/components/SidePanelInformationBanner.                                    |
| `ColorSchemeCard`                       | ColorSchemePicker/internal                                                                    |
| `IconListViewGrip`                      | object-record/record-table internal asset                                                     |
| `InputHint`                             | Field.Description or Field.Error for new forms; frontend input adapter for existing controls. |
| `InputLabel`                            | Field.Label for new forms; frontend input adapter for existing controls.                      |
| `JsonArrayNode`                         | JsonTree/internal                                                                             |
| `JsonNestedNode`                        | JsonTree entries for grouped roots; node implementation is private.                           |
| `JsonNode`                              | JsonTree/internal                                                                             |
| `JsonObjectNode`                        | JsonTree/internal                                                                             |
| `JsonTreeContextProvider`               | JsonTree owns context; grouped roots use entries.                                             |
| `JsonValueNode`                         | JsonTree/internal                                                                             |
| `AnimatedCircleLoading`                 | Frontend workflow/components/internal/AnimatedCircleLoading.                                  |
| `AnimatedContainer`                     | ui/layout shared motion style, private to its consumers                                       |
| `AnimatedEaseIn`                        | Frontend auth/components/internal/AnimatedEaseIn.                                             |
| `AnimatedEaseInOut`                     | AnimatedExpandableContainer with isExpanded, duration, and containAnimation={false}.          |
| `AnimatedRotate`                        | settings role-permission checkbox internal motion                                             |
| `AutogrowWrapper`                       | Frontend ui/input/components/internal/AutogrowWrapper.                                        |
| `ContactLink`                           | ui/field/display/internal                                                                     |
| `GithubVersionLink`                     | Removed; compose an application-owned release/version link.                                   |
| `MenuItemLeftContent`                   | ListItem startIcon, children, description, and actions slots.                                 |
| `StyledHoverableMenuItemBase`           | ListItem; internal menu implementation is private.                                            |
| `StyledMenuItemIconCheck`               | ListItem indicator="check" with selected, or compose endIcon.                                 |
| `StyledMenuItemLabel`                   | ListItem children; internal menu typography is private.                                       |
| `StyledMenuItemLeftContent`             | ListItem startIcon and children.                                                              |
| `MenuItemHotKeys`                       | row and button internal keyboard-hint implementation                                          |
| `NavigationBarItem`                     | NavigationBar/internal                                                                        |
| `RawLink`                               | Removed unused implementation. Use a native or host-router link.                              |
| `SocialLink`                            | ui/field/display and its URL-formatting helpers                                               |
| `UndecoratedLink`                       | ui/navigation, router-link adapter                                                            |
| `Label`                                 | Text with local styling; Field.Label for form semantics.                                      |
| `LinkifiedText`                         | Private typography implementation used by OverflowingTextWithTooltip.                         |
| `SeparatorLineText`                     | Removed unused implementation. Compose a labelled HorizontalSeparator.                        |
| `StyledTextContent`                     | Removed unused implementation. Compose Text locally.                                          |
| `StyledTextWrapper`                     | Removed unused implementation. Compose Text locally.                                          |
| `StyledText`                            | Auth renders Text with local styling.                                                         |

## Documentation and verification

Existing guides and examples use the new public imports. The Toast guide moves to the components section with a redirect. The Button and ButtonGroup guides embed their existing stories, and Tooltip is included in navigation.

The 12 existing story files for frontend-owned modules move beside their implementations. Their 37 stories remain available in the frontend Storybook.

This migration does not add the missing guides from the coverage report. Documentation coverage remains separate work. The checked-in ownership manifest enumerates public React exports; `check:ownership` verifies the generated barrels and prevents primitives, including their stories and tests, from importing or re-exporting shared compositions. Production UI code cannot depend on application code.

## Remaining migration plan

Status: planned, not implemented. The assessment covers all 32 current shared React exports: consolidate 7, move 7 to frontend owners, consider 8 for primitive ownership, and retain 10 as shared exports. These recommendations do not change the current export lists or ownership manifest above.

Retain modules that centralize a useful presentation, accessibility, or lifecycle contract. Small implementations can still earn a public interface, and primitives may compose other primitives. Treat the frontend ownership candidates below as design recommendations based on current callers, not proof that external consumers do not use them.

### Phase 1: Consolidate the menu family and correct Pill ownership

Start with these clear ownership and duplication issues. Keep `Menu.Item`: it provides menu interaction through Base UI and already renders `ListItem`.

| Current export | Planned replacement or owner | Behavior to preserve |
| --- | --- | --- |
| `MenuItem` | `ListItem` for general rows; `Menu.Item` inside a menu. | Icon containers, contextual-text tooltips, submenu-open presentation, disabled behavior, and click cancellation. |
| `MenuItemAvatar` | `ListItem` with `Avatar` in its `startIcon` slot. | Avatar size, shape, fallback, row actions, and description placement. |
| `MenuItemDraggable` | Frontend draggable-list row adapter built on `ListItem`. | Grip modes, icon-to-grip swapping, placeholder accents, cursor, and disabled styling. Actual dragging stays with the existing frontend drag owner. |
| `MenuItemSuggestion` | Frontend suggestion-row adapter built on `ListItem`. | Editor focus, selection, keyboard activation, and the semantics required by each mention or editor host. |
| `MenuPicker` | Frontend chart-type choice control using button/tooltip or radio primitives. | Selected styling, accessible labels, and keyboard behavior. Its current production frontend caller is `ChartTypeSelectionSection`. |
| `Pill` | Public primitive under `primitives/data-display`. | Compact label/icon presentation and `ButtonSoon` usage. Move its implementation with its public owner and remove the components re-export. |

### Phase 2: Reclassify foundational contracts

Prioritize `IconButton` and `TabButton`. Confirm the lower-priority category changes against their callers before moving them. Keep their existing behavior and interfaces unless a separate simplification is agreed.

| Current export | Proposed primitive family | Contract to retain |
| --- | --- | --- |
| `IconButton` | `input` | Icon-only dimensions, shapes, ButtonGroup sizing, and tooltip behavior for disabled/loading controls. |
| `TabButton` | `navigation` | Tab-styled buttons and links used for navigation, More actions, and measurements. Preserve its distinction from `Tabs.Tab`. |
| `NotificationCounter` | `data-display` | A count badge with no notification policy; its current frontend caller displays a multi-record drag count. Consider a generic name such as `CountBadge` separately. |
| `AvatarGroup` | `data-display` | Overlap, visible limit, and overflow-avatar placement. |
| `TintedIconTile` | `data-display` | Icon-tile sizing and theme-derived color shades. |
| `AnimatedIconCrossfade` | `layout` | Fixed-size icon transition, independent of the control that uses it. |
| `Section` | `layout` | The compound Root/Header interface, heading semantics, description association, and truncation. This is a lower-priority move with many callers. |

### Phase 3: Consolidate appearance presets and duplicate patterns

Define the replacement presentation before retiring each export. Existing primitive defaults are not sufficient to preserve every current appearance.

| Current export | Planned replacement | Behavior to preserve |
| --- | --- | --- |
| `LightButton` | `Button` with explicit appearance/defaults. | Small ghost presentation, regular weight, and subtle text color. |
| `MainButton` | `Button` with primary-action presentation. | Solid/elevated defaults, semibold weight, and wider padding. |
| `LightIconButton` | `IconButton` with explicit appearance/defaults. | Icon-size mapping, subtle color, and distinct disabled styling. |
| `CardPicker` | Card presentation within the `Radio` family, used with `RadioGroup`. | Card layout, indicator placement, selection, and form behavior. Its interaction already comes from `Radio`. |
| `Info` | One canonical `InlineBanner` pattern built on `Banner`. | Link/render support, button actions, wrapping, spacing, and colors. Extend the action interface before migrating link callers. |

Preserve the button sizes, elevated styles, animation, and dropdown-row behavior introduced by the recent button and dropdown migrations.

### Phase 4: Move frontend presentations and rebuild SearchInput

| Current export | Planned owner or implementation | Behavior to preserve |
| --- | --- | --- |
| `ColorSchemePicker` | Profile appearance settings, using radio choices and theme previews. | Light/Dark/System selection and preview presentation. |
| `CommandBlock` | Developer/application setup UI. | Command-line presentation and the supplied action button. |
| `NavigationBar` | Mobile navigation UI composed from icon controls. | Floating-bar layout, active state, accessible labels, and hide transition. |
| `RoundedLink` | Field/link display adapters and the admin external-link caller. | Safe URL handling, opening a new tab, click propagation, and pill-link presentation. |
| `SearchInput` | Keep the shared interface; rebuild it with `InputGroup`, `Input`, and button primitives. | Search adornment, focus treatment, controlled input, accessible labeling, and the optional filter trigger. |

### Shared compositions to retain

Together with `SearchInput`, retain these ten shared exports in total:

| Exports | Reason to retain |
| --- | --- |
| `InlineBanner` | Canonical compact message/action layout with focusable overflow disclosure. |
| `Callout` | Titled message with description, optional action, and dismissal. |
| `SettingsRow` | Label activation, description association, switch state, and form props across `ListItem` and `Switch`. |
| `JsonTree` | Traversal, expansion, node rendering, paths, and context behind one data-driven interface. |
| `CodeEditor`, `CodeEditorHeader` | Editor integration and toolbar presentation, kept in the optional code-editor family. |
| `Toast`, `ToastProvider`, `Toaster` | Distinct notification presentation, store lifetime, and portal/lifecycle responsibilities. |

### Migration requirements

- Update callers, public types, barrels, the ownership manifest, and the replacement table as each phase is implemented. Remove retired exports as a breaking package change.
- Keep implementations, private parts, tests, and stories beside their declared owner. Primitives must not import shared components or hide a shared component implementation in primitive internals to bypass the ownership check.
- Account for frontend, renderer, and companion callers. Keep changes under `packages/twenty-apps` in the separate application migration and coordinate it with the breaking package release.
- Preserve embedded story IDs when moving stories, or update all affected embeds. Adding missing guides remains separate work.
- Verify affected interactions through their public interfaces, including menu navigation, editor focus, drag handles, disabled tooltips, radio selection, link behavior, and action propagation. Run the ownership check, affected typechecks, and documentation checks for each implemented phase.
