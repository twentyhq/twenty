import { AVATAR_PROP_DESCRIPTIONS } from './avatarPropDescriptions';
import { BUTTON_GROUP_PROP_DESCRIPTIONS } from './buttonGroupPropDescriptions';
import { BUTTON_PROP_DESCRIPTIONS } from './buttonPropDescriptions';
import { CHIP_PROP_DESCRIPTIONS } from './chipPropDescriptions';
import { CODE_EDITOR_HEADER_PROP_DESCRIPTIONS } from './codeEditorHeaderPropDescriptions';
import { CODE_EDITOR_PROP_DESCRIPTIONS } from './codeEditorPropDescriptions';
import { DIALOG_PROP_DESCRIPTIONS } from './dialogPropDescriptions';
import { DIALOG_TITLE_PROP_DESCRIPTIONS } from './dialogTitlePropDescriptions';
import { HEADING_PROP_DESCRIPTIONS } from './headingPropDescriptions';
import { ICON_BUTTON_PROP_DESCRIPTIONS } from './iconButtonPropDescriptions';
import { LIGHT_BUTTON_PROP_DESCRIPTIONS } from './lightButtonPropDescriptions';
import { SECTION_HEADER_PROP_DESCRIPTIONS } from './sectionHeaderPropDescriptions';
import { SECTION_ROOT_PROP_DESCRIPTIONS } from './sectionRootPropDescriptions';
import { STATUS_PROP_DESCRIPTIONS } from './statusPropDescriptions';
import { TAG_PROP_DESCRIPTIONS } from './tagPropDescriptions';
import { TOOLTIP_PART_PROP_DESCRIPTIONS } from './tooltipPartPropDescriptions';
import { TOOLTIP_PROP_DESCRIPTIONS } from './tooltipPropDescriptions';

export const DOCUMENTED_COMPONENTS = [
  {
    name: 'IconButton',
    source: 'components/IconButton/IconButton.tsx',
    entryPoint: 'twenty-ui/components',
    slug: 'input/icon-button',
    propDescriptions: ICON_BUTTON_PROP_DESCRIPTIONS,
  },
  {
    name: 'MainButton',
    source: 'components/MainButton/MainButton.tsx',
    entryPoint: 'twenty-ui/components',
    slug: 'input/main-button',
    propDescriptions: BUTTON_PROP_DESCRIPTIONS,
  },
  {
    name: 'LightButton',
    source: 'components/LightButton/LightButton.tsx',
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
    source: 'components/Toast/Toast.tsx',
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
    name: 'Section',
    source: 'components/Section/Section.tsx',
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
    source: 'components/TabButton/TabButton.tsx',
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
