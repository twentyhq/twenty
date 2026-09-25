import { ANIMATED_EXPANDABLE_CONTAINER_PROP_DESCRIPTIONS } from './animatedExpandableContainerPropDescriptions';
import { AVATAR_PROP_DESCRIPTIONS } from './avatarPropDescriptions';
import { BANNER_PROP_DESCRIPTIONS } from './bannerPropDescriptions';
import { BUTTON_GROUP_PROP_DESCRIPTIONS } from './buttonGroupPropDescriptions';
import { BUTTON_PROP_DESCRIPTIONS } from './buttonPropDescriptions';
import { CARD_CONTENT_PROP_DESCRIPTIONS } from './cardContentPropDescriptions';
import { CARD_FOOTER_PROP_DESCRIPTIONS } from './cardFooterPropDescriptions';
import { CARD_HEADER_PROP_DESCRIPTIONS } from './cardHeaderPropDescriptions';
import { CARD_PROP_DESCRIPTIONS } from './cardPropDescriptions';
import { CHIP_PROP_DESCRIPTIONS } from './chipPropDescriptions';
import { CIRCULAR_PROGRESS_BAR_PROP_DESCRIPTIONS } from './circularProgressBarPropDescriptions';
import { CLICK_TO_ACTION_LINK_PROP_DESCRIPTIONS } from './clickToActionLinkPropDescriptions';
import { CODE_EDITOR_HEADER_PROP_DESCRIPTIONS } from './codeEditorHeaderPropDescriptions';
import { CODE_EDITOR_PROP_DESCRIPTIONS } from './codeEditorPropDescriptions';
import { COLOR_SAMPLE_PROP_DESCRIPTIONS } from './colorSamplePropDescriptions';
import { DIALOG_PROP_DESCRIPTIONS } from './dialogPropDescriptions';
import { DIALOG_TITLE_PROP_DESCRIPTIONS } from './dialogTitlePropDescriptions';
import { HEADING_PROP_DESCRIPTIONS } from './headingPropDescriptions';
import { HORIZONTAL_SEPARATOR_PROP_DESCRIPTIONS } from './horizontalSeparatorPropDescriptions';
import { ICON_BUTTON_PROP_DESCRIPTIONS } from './iconButtonPropDescriptions';
import { LIGHT_BUTTON_PROP_DESCRIPTIONS } from './lightButtonPropDescriptions';
import { LIGHT_ICON_BUTTON_PROP_DESCRIPTIONS } from './lightIconButtonPropDescriptions';
import { LOADER_PROP_DESCRIPTIONS } from './loaderPropDescriptions';
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
import { TEXT_DIRECTION_PROVIDER_PROP_DESCRIPTIONS } from './textDirectionProviderPropDescriptions';
import { TOOLTIP_PART_PROP_DESCRIPTIONS } from './tooltipPartPropDescriptions';
import { TOOLTIP_PROP_DESCRIPTIONS } from './tooltipPropDescriptions';
import { VISIBILITY_HIDDEN_PROP_DESCRIPTIONS } from './visibilityHiddenPropDescriptions';

export const DOCUMENTED_COMPONENTS = [
  {
    name: 'VisibilityHidden',
    source: 'primitives/accessibility/components/VisibilityHidden.tsx',
    entryPoint: 'twenty-ui/primitives/accessibility',
    slug: 'accessibility/visibility-hidden',
    propDescriptions: VISIBILITY_HIDDEN_PROP_DESCRIPTIONS,
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
  },
  {
    name: 'CircularProgressBar',
    source: 'primitives/feedback/CircularProgressBar/CircularProgressBar.tsx',
    entryPoint: 'twenty-ui/primitives/feedback',
    slug: 'feedback/circular-progress-bar',
    propDescriptions: CIRCULAR_PROGRESS_BAR_PROP_DESCRIPTIONS,
  },
  {
    name: 'Loader',
    source: 'primitives/feedback/Loader/Loader.tsx',
    entryPoint: 'twenty-ui/primitives/feedback',
    slug: 'feedback/loader',
    propDescriptions: LOADER_PROP_DESCRIPTIONS,
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
    name: 'AnimatedExpandableContainer',
    source:
      'primitives/layout/AnimatedExpandableContainer/AnimatedExpandableContainer.tsx',
    entryPoint: 'twenty-ui/primitives/layout',
    slug: 'layout/animated-expandable-container',
    propDescriptions: ANIMATED_EXPANDABLE_CONTAINER_PROP_DESCRIPTIONS,
  },
  {
    name: 'HorizontalSeparator',
    source: 'primitives/layout/HorizontalSeparator/HorizontalSeparator.tsx',
    entryPoint: 'twenty-ui/primitives/layout',
    slug: 'layout/horizontal-separator',
    propDescriptions: HORIZONTAL_SEPARATOR_PROP_DESCRIPTIONS,
  },
  {
    name: 'ResizeHandle',
    source: 'primitives/layout/ResizeHandle/ResizeHandle.tsx',
    entryPoint: 'twenty-ui/primitives/layout',
    slug: 'layout/resize-handle',
    propDescriptions: RESIZE_HANDLE_PROP_DESCRIPTIONS,
    propDefaults: { defaultValue: '150', min: '50', max: '500', step: '10' },
  },
  {
    name: 'TextDirectionProvider',
    source: 'primitives/layout/TextDirectionProvider/TextDirectionProvider.tsx',
    entryPoint: 'twenty-ui/primitives/layout',
    slug: 'layout/text-direction-provider',
    propDescriptions: TEXT_DIRECTION_PROVIDER_PROP_DESCRIPTIONS,
  },
  {
    name: 'ClickToActionLink',
    source: 'primitives/navigation/ClickToActionLink/ClickToActionLink.tsx',
    entryPoint: 'twenty-ui/primitives/navigation',
    slug: 'navigation/click-to-action-link',
    propDescriptions: CLICK_TO_ACTION_LINK_PROP_DESCRIPTIONS,
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
    entryPoint: 'twenty-ui/components',
    slug: 'input/light-icon-button',
    propDescriptions: LIGHT_ICON_BUTTON_PROP_DESCRIPTIONS,
  },
  {
    name: 'IconButton',
    source: 'components/input/IconButton/IconButton.tsx',
    entryPoint: 'twenty-ui/components',
    slug: 'input/icon-button',
    propDescriptions: ICON_BUTTON_PROP_DESCRIPTIONS,
  },
  {
    name: 'MainButton',
    source: 'components/input/MainButton/MainButton.tsx',
    entryPoint: 'twenty-ui/components',
    slug: 'input/main-button',
    propDescriptions: BUTTON_PROP_DESCRIPTIONS,
  },
  {
    name: 'LightButton',
    source: 'components/input/LightButton/LightButton.tsx',
    entryPoint: 'twenty-ui/components',
    slug: 'input/light-button',
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
  },
  {
    name: 'RadioGroup',
    source: 'primitives/input/RadioGroup/RadioGroup.tsx',
    entryPoint: 'twenty-ui/primitives/input',
    slug: 'input/radio-group',
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
    name: 'ListItem',
    source: 'primitives/navigation/ListItem/ListItem.tsx',
    entryPoint: 'twenty-ui/primitives/navigation',
    slug: 'navigation/list-item',
    propDescriptions: {
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
    propDescriptions: DIALOG_PROP_DESCRIPTIONS,
    partPropDescriptions: { Title: DIALOG_TITLE_PROP_DESCRIPTIONS },
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
    parts: ['Root', 'Trigger', 'Popup', 'Content', 'Provider'],
    propDescriptions: TOOLTIP_PROP_DESCRIPTIONS,
    propDefaults: { sideOffset: '10' },
    partPropDescriptions: TOOLTIP_PART_PROP_DESCRIPTIONS,
  },
  {
    name: 'Toast',
    source: 'components/feedback/Toast/Toast.tsx',
    entryPoint: 'twenty-ui/components',
    slug: 'feedback/toast',
  },
  {
    name: 'Text',
    source: 'primitives/typography/Text/Text.tsx',
    entryPoint: 'twenty-ui/primitives/typography',
    slug: 'typography/text',
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
    source: 'components/input/SettingsRow/SettingsRow.tsx',
    entryPoint: 'twenty-ui/components',
    slug: 'components/settings-row',
    propDescriptions: SETTINGS_ROW_PROP_DESCRIPTIONS,
  },
  {
    name: 'Dropdown',
    source: 'components/navigation/Dropdown/Dropdown.tsx',
    entryPoint: 'twenty-ui/components',
    slug: 'components/dropdown',
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
    ],
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
    name: 'Section',
    source: 'components/layout/Section/Section.tsx',
    entryPoint: 'twenty-ui/components',
    slug: 'components/section',
    partPropDescriptions: {
      Root: SECTION_ROOT_PROP_DESCRIPTIONS,
      Header: SECTION_HEADER_PROP_DESCRIPTIONS,
    },
  },
  {
    name: 'CodeEditor',
    source: 'components/code-editor/CodeEditor/CodeEditor.tsx',
    entryPoint: 'twenty-ui/components/code-editor',
    slug: 'components/code-editor',
    propDescriptions: CODE_EDITOR_PROP_DESCRIPTIONS,
  },
  {
    name: 'CodeEditorHeader',
    source: 'components/code-editor/CodeEditorHeader/CodeEditorHeader.tsx',
    entryPoint: 'twenty-ui/components/code-editor',
    slug: 'components/code-editor-header',
    propDescriptions: CODE_EDITOR_HEADER_PROP_DESCRIPTIONS,
  },
  {
    name: 'TabButton',
    source: 'components/navigation/TabButton/TabButton.tsx',
    entryPoint: 'twenty-ui/components',
    slug: 'components/tab-button',
    propDescriptions: {
      ...BUTTON_PROP_DESCRIPTIONS,
      active:
        'Highlights the current destination or an action associated with the active tab. Does not change the control role.',
      badge: 'Content following the label and trailing icon, such as a count.',
      size: 'Padding of the tab content: sm or md.',
    },
  },
] as const;
