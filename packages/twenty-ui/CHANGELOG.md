# Changelog

## Unreleased

### Breaking changes

Removed `MenuItemDraggable`, `MenuItemSuggestion` and `MenuPicker` from `twenty-ui/components/navigation` and the aggregate exports. Their props types and `MenuItemDraggableGripMode` are also removed. Applications must migrate these imports before upgrading.

| Removed API                                        | Replacement                                                                                                                                                                                                                                |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `MenuItemDraggable` and `MenuItemDraggableProps`   | Compose `ListItem` from `twenty-ui/primitives/navigation` inside the application's drag host. The host owns drag handles and reordering. Keep independent action buttons in `ListItem.actions`.                                            |
| `MenuItemSuggestion` and `MenuItemSuggestionProps` | Use `Dropdown.ActionItem` or `Dropdown.OptionItem` in a Dropdown page. For editor suggestions, compose `ListItem` or `ListItemButton` with the editor's option IDs and active-descendant state, keeping keyboard navigation in the editor. |
| `MenuPicker` and `MenuPickerProps`                 | Use `Button` from `twenty-ui/primitives/input` for standalone actions or pressed toggles. Use a selection owner such as `Dropdown.SelectionGroup` or `RadioGroup` when the workflow requires grouped choice navigation.                    |
| `MenuItemDraggableGripMode`                        | Choose grip presentation in the application's drag host.                                                                                                                                                                                   |

`MenuItem` and `MenuItemAvatar` remain available. The package remains in alpha and follows the Twenty SDK release version.
