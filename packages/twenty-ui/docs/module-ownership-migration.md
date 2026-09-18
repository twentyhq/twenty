# Breaking module ownership migration

This change removes the previous exports immediately. Release it as a breaking package change and migrate applications together with the library. The package now exposes 41 primitives and 50 shared React components, including the optional code editor.

## Choosing a module

- A primitive owns one foundational interaction or presentation contract. Examples include Button, Field, ListItem, Dialog, Text, and Avatar.
- A shared component combines primitives into a reusable presentation or interaction. It receives data, translated labels, callbacks, and render props from its host. It does not own application routing, record metadata, or application state.
- A frontend adapter owns product policy such as routing, field formatting, click-outside coordination, and empty-state illustrations. Feature-specific presentation stays with its feature.
- An implementation part stays private to the module that uses it. Import the owner and use its public parts or slots.

## Public imports

Foundational controls keep their `twenty-ui/primitives/<family>` imports. Import shared components and their public types from `twenty-ui/components`. The code editor keeps `twenty-ui/components/code-editor`. The `twenty-ui/primitives/json-visualizer` entry point is removed. Root imports still expose the supported public interface.

### Primitives

`VisibilityHidden`, `Avatar`, `Chip`, `ColorSample`, `Status`, `Tag`, `Banner`, `CircularProgressBar`, `Loader`, `ProgressBar`, `Button`, `ButtonGroup`, `Checkbox`, `Field`, `Input`, `InputGroup`, `Radio`, `RadioGroup`, `SegmentedControl`, `Select`, `Slider`, `Switch`, `Textarea`, `AnimatedExpandableContainer`, `HorizontalSeparator`, `ResizeHandle`, `TextDirectionProvider`, `ClickToActionLink`, `ListItem`, `Tabs`, `AlertDialog`, `Card`, `CardContent`, `CardFooter`, `CardHeader`, `Dialog`, `Menu`, `Popover`, `Tooltip`, `Heading`, `Text`.

### Shared components

`CodeEditor`, `CodeEditorHeader`, `IconButton`, `LightButton`, `MainButton`, `Section`, `TabButton`, `AvatarGroup`, `CommandBlock`, `NotificationCounter`, `Pill`, `TintedIconTile`, `Callout`, `Info`, `InlineBanner`, `Toast`, `ToastProvider`, `Toaster`, `AnimatedLightIconButton`, `CardPicker`, `ColorPickerButton`, `ColorSchemePicker`, `FloatingButton`, `FloatingButtonGroup`, `FloatingIconButton`, `FloatingIconButtonGroup`, `IconButtonGroup`, `LightIconButton`, `LightIconButtonGroup`, `RoundedIconButton`, `SearchInput`, `JsonTree`, `AnimatedIconCrossfade`, `MenuItem`, `MenuItemAvatar`, `MenuItemDraggable`, `MenuItemMultiSelect`, `MenuItemMultiSelectAvatar`, `MenuItemMultiSelectTag`, `MenuItemNavigate`, `MenuItemSelect`, `MenuItemSelectAvatar`, `MenuItemSelectColor`, `MenuItemSelectTag`, `MenuItemSuggestion`, `MenuItemSwitch`, `MenuPicker`, `NavigationBar`, `RoundedLink`, `OverflowingTextWithTooltip`.

## Interface changes

- `JsonTree` accepts either `value` or `entries: { id, label, value }[]`. Entry IDs determine highlighting paths; labels determine presentation. Its default expansion opens the first two levels. Use `shouldExpandNodeInitially` to override that policy. Node renderers, context, and traversal helpers are private.
- Replace custom menu-row assemblies with `ListItem` slots and native role/selection props. `actionsVisibility` preserves either persistent or hover/focus actions. Styled menu fragments are private.
- `Info` and `FloatingButton` accept `href` and `render` instead of `to`. Supply a router link through `render` when client-side navigation is required. React Router is an optional peer used only by testing decorators.
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
| `AnimatedButton`                        | Button composed with AnimatedIconCrossfade.                                                   |
| `ColorSchemeCard`                       | ColorSchemePicker/internal                                                                    |
| `IconListViewGrip`                      | object-record/record-table internal asset                                                     |
| `InputHint`                             | Field.Description or Field.Error for new forms; frontend input adapter for existing controls. |
| `InputLabel`                            | Field.Label for new forms; frontend input adapter for existing controls.                      |
| `InsideButton`                          | IconButtonGroup/internal.                                                                     |
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
| `StyledMenuItemSelect`                  | ListItem with role, aria-selected, selected, and indicator="check".                           |
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

This migration does not add the missing guides from the coverage report. Documentation coverage remains separate work. The checked-in ownership manifest enumerates public React exports; `check:ownership` verifies the generated barrels and prevents primitives from importing shared compositions or application code.
