# Reading direction audit

Applications pair `TextDirectionProvider` with an HTML `dir` attribute. Base UI reads the provider for keyboard and placement logic, and CSS reads `dir` for layout and mirrored icons.

## Reading-direction behavior

| Area | Behavior |
| --- | --- |
| Callout | Supporting text uses inline-start indentation. |
| JsonTree | Nested lists indent from inline-start. Collapsed disclosure arrows point toward inline-end; expanded arrows point down. |
| CardPicker | Text aligns to start. |
| ColorSchemePicker | Card spacing, inset content, borders, mixed-preview corners, and selection badge follow reading direction. |
| Button | The Soon badge consumes available space on its inline-start side. |
| ListItem, Menu, Dropdown | The built-in submenu and Back chevrons mirror through `:dir(rtl)`. Labels and descriptions retain truncation and logical alignment. |
| Menu, Popover, Tooltip, Select, Dialog, AlertDialog, Toaster | Under a `TextDirectionProvider`, portals set the provider direction as `dir`, including scoped themes and body portals. Without a provider they set no `dir` and inherit the direction of their container. Dropdown inherits Popover behavior. |
| Dropdown | Submenu keyboard navigation reads the same provider as submenu placement. Header and back-row icons supplied by consumers keep their orientation. |
| AvatarGroup | `overlap` remains a physical left/right edge. The zero-margin outer item follows row direction, preserving internal overlap without an outside negative margin. |

## Intentional physical cases

| Occurrence | Reason |
| --- | --- |
| Popover arrow left/right offsets and side selectors | Coordinates describe the physical side selected by Base UI collision handling. Popover also accepts logical `inline-start`/`inline-end` placement. |
| Tooltip arrow left/right offsets and side selectors | Tooltip only accepts physical `top`, `right`, `bottom`, and `left` sides, so callers choose the side for each direction. |
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

## Legacy menu compositions

Legacy MenuItem, MenuItemAvatar, MenuItemDraggable, MenuItemSuggestion, and MenuPicker keep physical contextual-text spacing, trailing-action positions, and their own submenu rotation until their consumers migrate to Dropdown. They are not covered by this audit.

## Build and renderer

The twenty-ui and twenty-front builds use their existing esbuild dependency to minify CSS while preserving native `:dir()` selectors. Direction-sensitive styles follow the HTML `dir` attribute independently of the document language.

The front component renderer forwards the global `dir` attribute on every element, which logical properties and `:dir()` selectors need inside front components. Popup compatibility in the renderer sandbox is tracked in the renderer gallery README.

Native preview accessibility checks defer only the existing low-contrast design tokens through the established `A11Y_DEFER_COLOR_CONTRAST` setting.
