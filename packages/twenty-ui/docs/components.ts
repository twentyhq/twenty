import { COUNTRY_SELECT_PROP_DESCRIPTIONS } from './countrySelectPropDescriptions';
import { CURRENCY_PICKER_PART_PROP_DESCRIPTIONS } from './currencyPickerPartPropDescriptions';
import { OVERFLOWING_LIST_PROP_DESCRIPTIONS } from './overflowingListPropDescriptions';
import { METRIC_ROW_PROP_DESCRIPTIONS } from './metricRowPropDescriptions';
import { PROGRESS_RING_PROP_DESCRIPTIONS } from './progressRingPropDescriptions';
import { AVATAR_GROUP_PROP_DESCRIPTIONS } from './avatarGroupPropDescriptions';
import { COMMAND_BLOCK_PROP_DESCRIPTIONS } from './commandBlockPropDescriptions';
import { JSON_TREE_PROP_DESCRIPTIONS } from './jsonTreePropDescriptions';
import { NOTIFICATION_COUNTER_PROP_DESCRIPTIONS } from './notificationCounterPropDescriptions';
import { TINTED_ICON_TILE_PROP_DESCRIPTIONS } from './tintedIconTilePropDescriptions';
import { CALLOUT_PROP_DESCRIPTIONS } from './calloutPropDescriptions';
import { INLINE_BANNER_PROP_DESCRIPTIONS } from './inlineBannerPropDescriptions';
import { TOAST_PROVIDER_PROP_DESCRIPTIONS } from './toastProviderPropDescriptions';
import { TOASTER_PROP_DESCRIPTIONS } from './toasterPropDescriptions';
import { RADIO_PROP_DESCRIPTIONS } from './radioPropDescriptions';
import { PHONE_COUNTRY_PICKER_PART_PROP_DESCRIPTIONS } from './phoneCountryPickerPartPropDescriptions';
import { SEARCH_INPUT_PROP_DESCRIPTIONS } from './searchInputPropDescriptions';
import { NUMBER_STEPPER_PROP_DESCRIPTIONS } from './numberStepperPropDescriptions';
import { IMAGE_INPUT_PROP_DESCRIPTIONS } from './imageInputPropDescriptions';
import { ANIMATED_ICON_CROSSFADE_PROP_DESCRIPTIONS } from './animatedIconCrossfadePropDescriptions';
import { MENU_ITEM_PROP_DESCRIPTIONS } from './menuItemPropDescriptions';
import { MENU_ITEM_AVATAR_PROP_DESCRIPTIONS } from './menuItemAvatarPropDescriptions';
import { MENU_ITEM_DRAGGABLE_PROP_DESCRIPTIONS } from './menuItemDraggablePropDescriptions';
import { MENU_ITEM_SUGGESTION_PROP_DESCRIPTIONS } from './menuItemSuggestionPropDescriptions';
import { MENU_PICKER_PROP_DESCRIPTIONS } from './menuPickerPropDescriptions';
import { THEME_PROVIDER_PROP_DESCRIPTIONS } from './themeProviderPropDescriptions';
import { ICON_PROP_DESCRIPTIONS } from './iconPropDescriptions';
import { ICONS_PROVIDER_PROP_DESCRIPTIONS } from './iconsProviderPropDescriptions';
import { ILLUSTRATION_ICON_WRAPPER_PROP_DESCRIPTIONS } from './illustrationIconWrapperPropDescriptions';
import { THINKING_ORBIT_LOADER_ICON_PROP_DESCRIPTIONS } from './thinkingOrbitLoaderIconPropDescriptions';
import { COMPONENT_STORYBOOK_LAYOUT_PROP_DESCRIPTIONS } from './componentStorybookLayoutPropDescriptions';
import { COLLAPSIBLE_PART_PROP_DESCRIPTIONS } from './collapsiblePropDescriptions';
import { AVATAR_PROP_DESCRIPTIONS } from './avatarPropDescriptions';
import { BANNER_PROP_DESCRIPTIONS } from './bannerPropDescriptions';
import { BREADCRUMB_PROP_DESCRIPTIONS } from './breadcrumbPropDescriptions';
import { BUTTON_GROUP_PROP_DESCRIPTIONS } from './buttonGroupPropDescriptions';
import { BUTTON_PROP_DESCRIPTIONS } from './buttonPropDescriptions';
import { CARD_CONTENT_PROP_DESCRIPTIONS } from './cardContentPropDescriptions';
import { CARD_FOOTER_PROP_DESCRIPTIONS } from './cardFooterPropDescriptions';
import { CARD_HEADER_PROP_DESCRIPTIONS } from './cardHeaderPropDescriptions';
import { CARD_PROP_DESCRIPTIONS } from './cardPropDescriptions';
import { CHIP_PROP_DESCRIPTIONS } from './chipPropDescriptions';
import { CODE_EDITOR_HEADER_PROP_DESCRIPTIONS } from './codeEditorHeaderPropDescriptions';
import { CODE_EDITOR_PROP_DESCRIPTIONS } from './codeEditorPropDescriptions';
import { COLOR_SAMPLE_PROP_DESCRIPTIONS } from './colorSamplePropDescriptions';
import { DIALOG_POPUP_PROP_DESCRIPTIONS } from './dialogPopupPropDescriptions';
import { DIALOG_TITLE_PROP_DESCRIPTIONS } from './dialogTitlePropDescriptions';
import { DROPDOWN_PART_PROP_DESCRIPTIONS } from './dropdownPartPropDescriptions';
import { TEXT_PROP_DESCRIPTIONS } from './textPropDescriptions';
import { HEADING_PROP_DESCRIPTIONS } from './headingPropDescriptions';
import { SEPARATOR_PROP_DESCRIPTIONS } from './separatorPropDescriptions';
import { ICON_BUTTON_PROP_DESCRIPTIONS } from './iconButtonPropDescriptions';
import { LIGHT_BUTTON_PROP_DESCRIPTIONS } from './lightButtonPropDescriptions';
import { LIGHT_ICON_BUTTON_PROP_DESCRIPTIONS } from './lightIconButtonPropDescriptions';
import { LOADER_PROP_DESCRIPTIONS } from './loaderPropDescriptions';
import { SKELETON_PROP_DESCRIPTIONS } from './skeletonPropDescriptions';
import { OVERFLOWING_TEXT_WITH_TOOLTIP_PROP_DESCRIPTIONS } from './overflowingTextWithTooltipPropDescriptions';
import { PILL_PROP_DESCRIPTIONS } from './pillPropDescriptions';
import { PROGRESS_BAR_PROP_DESCRIPTIONS } from './progressBarPropDescriptions';
import { RESIZE_HANDLE_PROP_DESCRIPTIONS } from './resizeHandlePropDescriptions';
import { SECTION_HEADER_PROP_DESCRIPTIONS } from './sectionHeaderPropDescriptions';
import { SECTION_ROOT_PROP_DESCRIPTIONS } from './sectionRootPropDescriptions';
import { SEGMENTED_CONTROL_PROP_DESCRIPTIONS } from './segmentedControlPropDescriptions';
import { SETTINGS_ROW_PROP_DESCRIPTIONS } from './settingsRowPropDescriptions';
import { STATUS_PROP_DESCRIPTIONS } from './statusPropDescriptions';
import { TAG_PROP_DESCRIPTIONS } from './tagPropDescriptions';
import { DIRECTION_PROVIDER_PROP_DESCRIPTIONS } from './directionProviderPropDescriptions';
import { TOOLTIP_PART_PROP_DESCRIPTIONS } from './tooltipPartPropDescriptions';
import { TOOLTIP_PROP_DESCRIPTIONS } from './tooltipPropDescriptions';
import { VISUALLY_HIDDEN_PROP_DESCRIPTIONS } from './visuallyHiddenPropDescriptions';

export const DOCUMENTED_COMPONENTS = [
  {
    name: 'CountrySelect',
    source: 'components/input/CountrySelect/CountrySelect.tsx',
    entryPoint: 'twenty-ui/components/input',
    slug: 'components/input/country-select',
    propDescriptions: COUNTRY_SELECT_PROP_DESCRIPTIONS,
  },
  {
    name: 'CurrencyPicker',
    source: 'components/input/CurrencyPicker/CurrencyPicker.tsx',
    entryPoint: 'twenty-ui/components/input',
    slug: 'components/input/currency-picker',
    parts: ['Trigger', 'Options'],
    partPropDescriptions: CURRENCY_PICKER_PART_PROP_DESCRIPTIONS,
  },
  {
    name: 'ProgressRing',
    source: 'primitives/feedback/ProgressRing/ProgressRing.tsx',
    entryPoint: 'twenty-ui/primitives/feedback',
    slug: 'feedback/progress-ring',
    propDescriptions: PROGRESS_RING_PROP_DESCRIPTIONS,
  },
  {
    name: 'MetricRow',
    source: 'components/data-display/MetricRow/MetricRow.tsx',
    entryPoint: 'twenty-ui/components/data-display',
    slug: 'components/data-display/metric-row',
    propDescriptions: METRIC_ROW_PROP_DESCRIPTIONS,
  },
  {
    name: 'Shortcut',
    source: 'primitives/typography/Shortcut/Shortcut.tsx',
    entryPoint: 'twenty-ui/primitives/typography',
    slug: 'typography/shortcut',
    propDescriptions: {
      shortcut:
        'Flat key array for a simultaneous combination, or nested key arrays for an ordered sequence of combinations.',
      platform:
        'Optional mac or other platform override. Defaults to server-safe device detection.',
      sequenceJoinLabel: 'Text between sequence steps. Defaults to then.',
      combinationSeparator:
        'Optional separator between simultaneous keys. Defaults to no separator on Apple devices and a space elsewhere.',
      variant: 'Keycaps, inline text, or a separated button hint.',
      visibility:
        'Always visible by default. Desktop hints hide on mobile viewports.',
    },
  },
  {
    name: 'VisuallyHidden',
    source: 'primitives/accessibility/components/VisuallyHidden.tsx',
    entryPoint: 'twenty-ui/primitives/accessibility',
    slug: 'accessibility/visually-hidden',
    propDescriptions: VISUALLY_HIDDEN_PROP_DESCRIPTIONS,
  },
  {
    name: 'ColorSample',
    source: 'primitives/data-display/ColorSample/ColorSample.tsx',
    entryPoint: 'twenty-ui/primitives/data-display',
    slug: 'data-display/color-sample',
    propDescriptions: COLOR_SAMPLE_PROP_DESCRIPTIONS,
  },
  {
    name: 'Pill',
    source: 'primitives/data-display/Pill/Pill.tsx',
    entryPoint: 'twenty-ui/primitives/data-display',
    slug: 'data-display/pill',
    propDescriptions: PILL_PROP_DESCRIPTIONS,
  },
  {
    name: 'Banner',
    source: 'primitives/feedback/Banner/Banner.tsx',
    entryPoint: 'twenty-ui/primitives/feedback',
    slug: 'feedback/banner',
    propDescriptions: BANNER_PROP_DESCRIPTIONS,
    propDefaults: { color: 'status palette', status: 'info', variant: 'solid' },
    parts: ['Action'],
    partPropDescriptions: { Action: BUTTON_PROP_DESCRIPTIONS },
  },
  {
    name: 'Loader',
    source: 'primitives/feedback/Loader/Loader.tsx',
    entryPoint: 'twenty-ui/primitives/feedback',
    slug: 'feedback/loader',
    propDescriptions: LOADER_PROP_DESCRIPTIONS,
  },
  {
    name: 'Skeleton',
    source: 'primitives/feedback/Skeleton/Skeleton.tsx',
    entryPoint: 'twenty-ui/primitives/feedback',
    slug: 'feedback/skeleton',
    propDescriptions: SKELETON_PROP_DESCRIPTIONS,
  },
  {
    name: 'ProgressBar',
    source: 'primitives/feedback/ProgressBar/ProgressBar.tsx',
    entryPoint: 'twenty-ui/primitives/feedback',
    slug: 'feedback/progress-bar',
    propDescriptions: PROGRESS_BAR_PROP_DESCRIPTIONS,
  },
  {
    name: 'SegmentedControl',
    source: 'primitives/input/SegmentedControl/SegmentedControl.tsx',
    entryPoint: 'twenty-ui/primitives/input',
    slug: 'input/segmented-control',
    propDescriptions: SEGMENTED_CONTROL_PROP_DESCRIPTIONS,
  },
  {
    name: 'Collapsible',
    source: 'primitives/layout/Collapsible/Collapsible.tsx',
    entryPoint: 'twenty-ui/primitives/layout',
    slug: 'layout/collapsible',
    partPropDescriptions: COLLAPSIBLE_PART_PROP_DESCRIPTIONS,
    partPropDefaults: {
      Panel: {
        dimension: 'height',
        containAnimation: 'true',
        duration: 'normal',
      },
    },
  },
  {
    name: 'Separator',
    source: 'primitives/layout/Separator/Separator.tsx',
    entryPoint: 'twenty-ui/primitives/layout',
    slug: 'layout/separator',
    propDescriptions: SEPARATOR_PROP_DESCRIPTIONS,
  },
  {
    name: 'ResizeHandle',
    source: 'primitives/layout/ResizeHandle/ResizeHandle.tsx',
    entryPoint: 'twenty-ui/primitives/layout',
    slug: 'layout/resize-handle',
    propDescriptions: RESIZE_HANDLE_PROP_DESCRIPTIONS,
    propDefaults: {
      axis: 'y without edge',
      defaultValue: '150',
      dragThreshold: '5 with edge; 0 otherwise',
      min: '50',
      max: '500',
      placement: 'edge with edge; inline otherwise',
      step: '10',
    },
  },
  {
    name: 'DirectionProvider',
    source: 'primitives/layout/DirectionProvider/DirectionProvider.tsx',
    entryPoint: 'twenty-ui/primitives/layout',
    slug: 'layout/direction-provider',
    propDescriptions: DIRECTION_PROVIDER_PROP_DESCRIPTIONS,
  },
  {
    name: 'OverflowingTextWithTooltip',
    source:
      'primitives/typography/OverflowingTextWithTooltip/OverflowingTextWithTooltip.tsx',
    entryPoint: 'twenty-ui/primitives/typography',
    slug: 'typography/overflowing-text-with-tooltip',
    propDescriptions: OVERFLOWING_TEXT_WITH_TOOLTIP_PROP_DESCRIPTIONS,
  },
  {
    name: 'LightIconButton',
    source: 'components/input/LightIconButton/LightIconButton.tsx',
    entryPoint: 'twenty-ui/components/input',
    slug: 'components/input/light-icon-button',
    propDescriptions: LIGHT_ICON_BUTTON_PROP_DESCRIPTIONS,
  },
  {
    name: 'IconButton',
    source: 'components/input/IconButton/IconButton.tsx',
    entryPoint: 'twenty-ui/components/input',
    slug: 'components/input/icon-button',
    propDescriptions: ICON_BUTTON_PROP_DESCRIPTIONS,
  },
  {
    name: 'MainButton',
    source: 'components/input/MainButton/MainButton.tsx',
    entryPoint: 'twenty-ui/components/input',
    slug: 'components/input/main-button',
    propDescriptions: BUTTON_PROP_DESCRIPTIONS,
  },
  {
    name: 'LightButton',
    source: 'components/input/LightButton/LightButton.tsx',
    entryPoint: 'twenty-ui/components/input',
    slug: 'components/input/light-button',
    propDescriptions: LIGHT_BUTTON_PROP_DESCRIPTIONS,
  },
  {
    name: 'Button',
    source: 'primitives/input/Button/Button.tsx',
    entryPoint: 'twenty-ui/primitives/input',
    slug: 'input/button',
    propDescriptions: BUTTON_PROP_DESCRIPTIONS,
  },
  {
    name: 'ButtonGroup',
    source: 'primitives/input/ButtonGroup/ButtonGroup.tsx',
    entryPoint: 'twenty-ui/primitives/input',
    slug: 'input/button-group',
    propDescriptions: BUTTON_GROUP_PROP_DESCRIPTIONS,
  },
  {
    name: 'Field',
    source: 'primitives/input/Field/Field.tsx',
    entryPoint: 'twenty-ui/primitives/input',
    slug: 'input/field',
    partPropDescriptions: {
      Control: {
        defaultValue: 'The default value of the input. Use when uncontrolled.',
      },
    },
  },
  {
    name: 'Input',
    source: 'primitives/input/Input/Input.tsx',
    entryPoint: 'twenty-ui/primitives/input',
    slug: 'input/input',
  },
  {
    name: 'InputGroup',
    source: 'primitives/input/InputGroup/InputGroup.tsx',
    entryPoint: 'twenty-ui/primitives/input',
    slug: 'input/input-group',
  },
  {
    name: 'NumberStepper',
    source: 'primitives/input/NumberStepper/NumberStepper.tsx',
    entryPoint: 'twenty-ui/primitives/input',
    slug: 'input/number-stepper',
    propDescriptions: NUMBER_STEPPER_PROP_DESCRIPTIONS,
  },
  {
    name: 'Textarea',
    source: 'primitives/input/Textarea/Textarea.tsx',
    entryPoint: 'twenty-ui/primitives/input',
    slug: 'input/textarea',
  },
  {
    name: 'Checkbox',
    source: 'primitives/input/Checkbox/Checkbox.tsx',
    entryPoint: 'twenty-ui/primitives/input',
    slug: 'input/checkbox',
  },
  {
    name: 'Radio',
    source: 'primitives/input/Radio/Radio.tsx',
    entryPoint: 'twenty-ui/primitives/input',
    slug: 'input/radio',
    propDescriptions: RADIO_PROP_DESCRIPTIONS,
  },
  {
    name: 'RadioGroup',
    source: 'primitives/input/RadioGroup/RadioGroup.tsx',
    entryPoint: 'twenty-ui/primitives/input',
    slug: 'input/radio-group',
  },
  {
    name: 'Autocomplete',
    source: 'primitives/input/Autocomplete/Autocomplete.tsx',
    entryPoint: 'twenty-ui/primitives/input',
    slug: 'input/autocomplete',
    partPropDescriptions: {
      Root: {
        items:
          'Items to display in the list. Nullish entries are not supported.',
      },
      Input: {
        size: 'Visual size of the input. Inside an InputGroup, the group size applies.',
      },
      Popup: {
        width:
          'Width of the popup. Overrides its default minimum anchor width.',
        container:
          'Element the popup is portaled into. Defaults to the theme portal container.',
      },
    },
  },
  {
    name: 'Select',
    source: 'primitives/input/Select/Select.tsx',
    entryPoint: 'twenty-ui/primitives/input',
    slug: 'input/select',
  },
  {
    name: 'Slider',
    source: 'primitives/input/Slider/Slider.tsx',
    entryPoint: 'twenty-ui/primitives/input',
    slug: 'input/slider',
  },
  {
    name: 'Switch',
    source: 'primitives/input/Switch/Switch.tsx',
    entryPoint: 'twenty-ui/primitives/input',
    slug: 'input/switch',
  },
  {
    name: 'Breadcrumb',
    source: 'primitives/navigation/Breadcrumb/Breadcrumb.tsx',
    entryPoint: 'twenty-ui/primitives/navigation',
    slug: 'navigation/breadcrumb',
    propDescriptions: BREADCRUMB_PROP_DESCRIPTIONS,
  },
  {
    name: 'ListItem',
    source: 'primitives/navigation/ListItem/ListItem.tsx',
    entryPoint: 'twenty-ui/primitives/navigation',
    slug: 'navigation/list-item',
    propDescriptions: {
      shortcutJoinLabel:
        'Text between sequential shortcut steps. Defaults to `then`; pass an empty string to omit it.',
      actionsVisibility:
        'When trailing actions are visible: on hover and focus, or always.',
    },
  },
  {
    name: 'Tabs',
    source: 'primitives/navigation/Tabs/Tabs.tsx',
    entryPoint: 'twenty-ui/primitives/navigation',
    slug: 'navigation/tabs',
    partPropDescriptions: {
      Tab: {
        endIcon: 'Decorative content after the label and before the badge.',
        highlighted: 'Emphasizes the tab content without changing selection.',
      },
    },
  },
  {
    name: 'Card',
    source: 'primitives/surfaces/Card/Card.tsx',
    entryPoint: 'twenty-ui/primitives/surfaces',
    slug: 'surfaces/card',
    partPropDescriptions: {
      Root: CARD_PROP_DESCRIPTIONS,
      Header: CARD_HEADER_PROP_DESCRIPTIONS,
      Content: CARD_CONTENT_PROP_DESCRIPTIONS,
      Footer: CARD_FOOTER_PROP_DESCRIPTIONS,
    },
    partPropDefaults: { Footer: { divider: 'true' } },
  },
  {
    name: 'Dialog',
    source: 'primitives/surfaces/Dialog/Dialog.tsx',
    entryPoint: 'twenty-ui/primitives/surfaces',
    slug: 'surfaces/dialog',
    partPropDescriptions: {
      Popup: DIALOG_POPUP_PROP_DESCRIPTIONS,
      Title: DIALOG_TITLE_PROP_DESCRIPTIONS,
    },
  },
  {
    name: 'AlertDialog',
    source: 'primitives/surfaces/AlertDialog/AlertDialog.tsx',
    entryPoint: 'twenty-ui/primitives/surfaces',
    slug: 'surfaces/alert-dialog',
  },
  {
    name: 'Menu',
    source: 'primitives/surfaces/Menu/Menu.tsx',
    entryPoint: 'twenty-ui/primitives/surfaces',
    slug: 'surfaces/menu',
    partPropDescriptions: {
      Item: {
        shortcutJoinLabel:
          'Text between sequential shortcut steps. Defaults to `then`.',
      },
      CheckboxItem: {
        shortcutJoinLabel:
          'Text between sequential shortcut steps. Defaults to `then`.',
      },
      RadioItem: {
        shortcutJoinLabel:
          'Text between sequential shortcut steps. Defaults to `then`.',
      },
      SubmenuTrigger: {
        shortcutJoinLabel:
          'Text between sequential shortcut steps. Defaults to `then`.',
        onClick: 'The click handler for the submenu trigger.',
      },
    },
  },
  {
    name: 'Popover',
    source: 'primitives/surfaces/Popover/Popover.tsx',
    entryPoint: 'twenty-ui/primitives/surfaces',
    slug: 'surfaces/popover',
  },
  {
    name: 'Tooltip',
    source: 'primitives/surfaces/Tooltip/Tooltip.tsx',
    entryPoint: 'twenty-ui/primitives/surfaces',
    slug: 'surfaces/tooltip',
    parts: [
      'Root',
      'Trigger',
      'Portal',
      'Positioner',
      'Popup',
      'Arrow',
      'Viewport',
      'Provider',
    ],
    propDescriptions: TOOLTIP_PROP_DESCRIPTIONS,
    propDefaults: { sideOffset: '10' },
    partPropDescriptions: TOOLTIP_PART_PROP_DESCRIPTIONS,
  },
  {
    name: 'Toast',
    source: 'components/feedback/Toast/Toast.tsx',
    entryPoint: 'twenty-ui/components/feedback',
    slug: 'components/feedback/toast',
  },
  {
    name: 'Text',
    source: 'primitives/typography/Text/Text.tsx',
    entryPoint: 'twenty-ui/primitives/typography',
    slug: 'typography/text',
    propDescriptions: TEXT_PROP_DESCRIPTIONS,
  },
  {
    name: 'Avatar',
    source: 'primitives/data-display/Avatar/Avatar.tsx',
    entryPoint: 'twenty-ui/primitives/data-display',
    slug: 'data-display/avatar',
    propDescriptions: AVATAR_PROP_DESCRIPTIONS,
  },
  {
    name: 'Chip',
    source: 'primitives/data-display/Chip/Chip.tsx',
    entryPoint: 'twenty-ui/primitives/data-display',
    slug: 'data-display/chip',
    propDescriptions: CHIP_PROP_DESCRIPTIONS,
  },
  {
    name: 'Tag',
    source: 'primitives/data-display/Tag/Tag.tsx',
    entryPoint: 'twenty-ui/primitives/data-display',
    slug: 'data-display/tag',
    propDescriptions: TAG_PROP_DESCRIPTIONS,
  },
  {
    name: 'Status',
    source: 'primitives/data-display/Status/Status.tsx',
    entryPoint: 'twenty-ui/primitives/data-display',
    slug: 'data-display/status',
    propDescriptions: STATUS_PROP_DESCRIPTIONS,
  },
  {
    name: 'Heading',
    source: 'primitives/typography/Heading/Heading.tsx',
    entryPoint: 'twenty-ui/primitives/typography',
    slug: 'typography/heading',
    propDescriptions: HEADING_PROP_DESCRIPTIONS,
  },
  {
    name: 'SettingsRow',
    source: 'components/settings/SettingsRow/SettingsRow.tsx',
    entryPoint: 'twenty-ui/components/settings',
    slug: 'components/settings/settings-row',
    propDescriptions: SETTINGS_ROW_PROP_DESCRIPTIONS,
  },
  {
    name: 'PhoneCountryPicker',
    source: 'components/input/PhoneCountryPicker/PhoneCountryPicker.tsx',
    entryPoint: 'twenty-ui/components/input',
    slug: 'components/input/phone-country-picker',
    parts: ['Trigger', 'Options'],
    partPropDescriptions: PHONE_COUNTRY_PICKER_PART_PROP_DESCRIPTIONS,
  },
  {
    name: 'Dropdown',
    source: 'components/navigation/Dropdown/Dropdown.tsx',
    entryPoint: 'twenty-ui/components/navigation',
    slug: 'components/navigation/dropdown',
    parts: [
      'Root',
      'Trigger',
      'Content',
      'ActionItem',
      'OptionItem',
      'Search',
      'Header',
      'Title',
      'Close',
      'Page',
      'Back',
      'Submenu',
      'SubmenuTrigger',
      'Section',
      'Separator',
      'Loading',
      'Empty',
    ],
    partPropDescriptions: DROPDOWN_PART_PROP_DESCRIPTIONS,
    partPropDefaults: {
      ActionItem: {
        nativeButton: 'true when render is omitted; false otherwise',
      },
      OptionItem: {
        nativeButton: 'true when render is omitted; false otherwise',
      },
      Back: {
        nativeButton: 'true when render is omitted; false otherwise',
      },
      SubmenuTrigger: {
        nativeButton: 'true when render is omitted; false otherwise',
      },
    },
  },
  {
    name: 'OverflowingList',
    source: 'components/layout/OverflowingList/OverflowingList.tsx',
    entryPoint: 'twenty-ui/components/layout',
    slug: 'components/layout/overflowing-list',
    propDescriptions: OVERFLOWING_LIST_PROP_DESCRIPTIONS,
  },
  {
    name: 'Section',
    source: 'components/layout/Section/Section.tsx',
    entryPoint: 'twenty-ui/components/layout',
    slug: 'components/layout/section',
    partPropDescriptions: {
      Root: SECTION_ROOT_PROP_DESCRIPTIONS,
      Header: SECTION_HEADER_PROP_DESCRIPTIONS,
    },
  },
  {
    name: 'CodeEditor',
    source: 'components/code-editor/CodeEditor/CodeEditor.tsx',
    entryPoint: 'twenty-ui/components/code-editor',
    slug: 'components/code-editor/code-editor',
    propDescriptions: CODE_EDITOR_PROP_DESCRIPTIONS,
  },
  {
    name: 'CodeEditorHeader',
    source: 'components/code-editor/CodeEditorHeader/CodeEditorHeader.tsx',
    entryPoint: 'twenty-ui/components/code-editor',
    slug: 'components/code-editor/code-editor-header',
    propDescriptions: CODE_EDITOR_HEADER_PROP_DESCRIPTIONS,
  },
  {
    name: 'TabButton',
    source: 'components/navigation/TabButton/TabButton.tsx',
    entryPoint: 'twenty-ui/components/navigation',
    slug: 'components/navigation/tab-button',
    propDescriptions: {
      ...BUTTON_PROP_DESCRIPTIONS,
      active:
        'Highlights the current destination or an action associated with the active tab. Does not change the control role.',
      badge: 'Content following the label and trailing icon, such as a count.',
      size: 'Padding of the tab content: sm or md.',
    },
  },
  {
    name: 'AvatarGroup',
    source: 'components/data-display/AvatarGroup/AvatarGroup.tsx',
    entryPoint: 'twenty-ui/components/data-display',
    slug: 'components/data-display/avatar-group',
    propDescriptions: AVATAR_GROUP_PROP_DESCRIPTIONS,
  },
  {
    name: 'CommandBlock',
    source: 'components/data-display/CommandBlock/CommandBlock.tsx',
    entryPoint: 'twenty-ui/components/data-display',
    slug: 'components/data-display/command-block',
    propDescriptions: COMMAND_BLOCK_PROP_DESCRIPTIONS,
  },
  {
    name: 'JsonTree',
    source: 'components/data-display/JsonTree/JsonTree.tsx',
    entryPoint: 'twenty-ui/components/data-display',
    slug: 'components/data-display/json-tree',
    propDescriptions: JSON_TREE_PROP_DESCRIPTIONS,
  },
  {
    name: 'NotificationCounter',
    source:
      'components/data-display/NotificationCounter/NotificationCounter.tsx',
    entryPoint: 'twenty-ui/components/data-display',
    slug: 'components/data-display/notification-counter',
    propDescriptions: NOTIFICATION_COUNTER_PROP_DESCRIPTIONS,
  },
  {
    name: 'TintedIconTile',
    source: 'components/data-display/TintedIconTile/TintedIconTile.tsx',
    entryPoint: 'twenty-ui/components/data-display',
    slug: 'components/data-display/tinted-icon-tile',
    propDescriptions: TINTED_ICON_TILE_PROP_DESCRIPTIONS,
  },
  {
    name: 'Callout',
    nativeProps: 'div',
    source: 'components/feedback/Callout/Callout.tsx',
    entryPoint: 'twenty-ui/components/feedback',
    slug: 'components/feedback/callout',
    propDescriptions: CALLOUT_PROP_DESCRIPTIONS,
    parts: ['Action'],
    partPropDescriptions: { Action: BUTTON_PROP_DESCRIPTIONS },
    propDefaults: {
      closeLabel: 'Close',
      color: 'status palette',
      fullWidth: 'false',
      icon: 'decorative help icon',
      status: 'info',
      variant: 'soft',
    },
  },
  {
    name: 'InlineBanner',
    source: 'components/feedback/InlineBanner/InlineBanner.tsx',
    entryPoint: 'twenty-ui/components/feedback',
    slug: 'components/feedback/inline-banner',
    propDescriptions: INLINE_BANNER_PROP_DESCRIPTIONS,
    parts: ['Action'],
    partPropDescriptions: { Action: BUTTON_PROP_DESCRIPTIONS },
    propDefaults: {
      color: 'status palette',
      status: 'info',
      variant: 'soft',
      layout: 'standard',
      embedded: 'false',
      icon: 'decorative information icon',
    },
  },
  {
    name: 'ToastProvider',
    source: 'components/feedback/Toast/ToastProvider.tsx',
    entryPoint: 'twenty-ui/components/feedback',
    slug: 'components/feedback/toast-provider',
    propDescriptions: TOAST_PROVIDER_PROP_DESCRIPTIONS,
  },
  {
    name: 'Toaster',
    source: 'components/feedback/Toaster/Toaster.tsx',
    entryPoint: 'twenty-ui/components/feedback',
    slug: 'components/feedback/toaster',
    propDescriptions: TOASTER_PROP_DESCRIPTIONS,
  },
  {
    name: 'ImageInput',
    source: 'components/input/ImageInput/ImageInput.tsx',
    entryPoint: 'twenty-ui/components/input',
    slug: 'components/input/image-input',
    propDescriptions: IMAGE_INPUT_PROP_DESCRIPTIONS,
  },
  {
    name: 'SearchInput',
    source: 'components/input/SearchInput/SearchInput.tsx',
    entryPoint: 'twenty-ui/components/input',
    slug: 'components/input/search-input',
    propDescriptions: SEARCH_INPUT_PROP_DESCRIPTIONS,
  },
  {
    name: 'AnimatedIconCrossfade',
    source: 'components/layout/AnimatedIconCrossfade/AnimatedIconCrossfade.tsx',
    entryPoint: 'twenty-ui/components/layout',
    slug: 'components/layout/animated-icon-crossfade',
    propDescriptions: ANIMATED_ICON_CROSSFADE_PROP_DESCRIPTIONS,
  },
  {
    name: 'MenuItem',
    source: 'components/navigation/MenuItem/MenuItem.tsx',
    entryPoint: 'twenty-ui/components/navigation',
    slug: 'components/navigation/menu-item',
    propDescriptions: MENU_ITEM_PROP_DESCRIPTIONS,
  },
  {
    name: 'MenuItemAvatar',
    source: 'components/navigation/MenuItemAvatar/MenuItemAvatar.tsx',
    entryPoint: 'twenty-ui/components/navigation',
    slug: 'components/navigation/menu-item-avatar',
    propDescriptions: MENU_ITEM_AVATAR_PROP_DESCRIPTIONS,
  },
  {
    name: 'MenuItemDraggable',
    source: 'components/navigation/MenuItemDraggable/MenuItemDraggable.tsx',
    entryPoint: 'twenty-ui/components/navigation',
    slug: 'components/navigation/menu-item-draggable',
    propDescriptions: MENU_ITEM_DRAGGABLE_PROP_DESCRIPTIONS,
  },
  {
    name: 'MenuItemSuggestion',
    source: 'components/navigation/MenuItemSuggestion/MenuItemSuggestion.tsx',
    entryPoint: 'twenty-ui/components/navigation',
    slug: 'components/navigation/menu-item-suggestion',
    propDescriptions: MENU_ITEM_SUGGESTION_PROP_DESCRIPTIONS,
  },
  {
    name: 'MenuPicker',
    source: 'components/navigation/MenuPicker/MenuPicker.tsx',
    entryPoint: 'twenty-ui/components/navigation',
    slug: 'components/navigation/menu-picker',
    propDescriptions: MENU_PICKER_PROP_DESCRIPTIONS,
  },
  {
    name: 'ThemeProvider',
    source: 'theme/ThemeProvider.tsx',
    entryPoint: 'twenty-ui/theme',
    slug: 'theme/theme-provider',
    propDescriptions: THEME_PROVIDER_PROP_DESCRIPTIONS,
  },
  {
    name: 'Icon',
    source: 'icon/components/Icon.tsx',
    entryPoint: 'twenty-ui/icon',
    slug: 'icon/icon',
    propDescriptions: ICON_PROP_DESCRIPTIONS,
  },
  {
    name: 'IconsProvider',
    source: 'icon/providers/IconsProvider.tsx',
    entryPoint: 'twenty-ui/icon',
    slug: 'icon/icons-provider',
    propDescriptions: ICONS_PROVIDER_PROP_DESCRIPTIONS,
  },
  {
    name: 'IllustrationIconWrapper',
    source: 'icon/components/IllustrationIconWrapper.tsx',
    entryPoint: 'twenty-ui/icon',
    slug: 'icon/illustration-icon-wrapper',
    propDescriptions: ILLUSTRATION_ICON_WRAPPER_PROP_DESCRIPTIONS,
  },
  {
    name: 'ThinkingOrbitLoaderIcon',
    source: 'icon/components/ThinkingOrbitLoaderIcon.tsx',
    entryPoint: 'twenty-ui/icon',
    slug: 'icon/thinking-orbit-loader-icon',
    propDescriptions: THINKING_ORBIT_LOADER_ICON_PROP_DESCRIPTIONS,
  },
  {
    name: 'ComponentStorybookLayout',
    source: 'testing/ComponentStorybookLayout.tsx',
    entryPoint: 'twenty-ui/testing',
    slug: 'testing/component-storybook-layout',
    propDescriptions: COMPONENT_STORYBOOK_LAYOUT_PROP_DESCRIPTIONS,
  },
] as const;
