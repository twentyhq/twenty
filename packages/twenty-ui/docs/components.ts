import { AVATAR_PROP_DESCRIPTIONS } from './avatarPropDescriptions';
import { BUTTON_GROUP_PROP_DESCRIPTIONS } from './buttonGroupPropDescriptions';
import { BUTTON_PROP_DESCRIPTIONS } from './buttonPropDescriptions';
import { CHIP_PROP_DESCRIPTIONS } from './chipPropDescriptions';
import { LIGHT_BUTTON_PROP_DESCRIPTIONS } from './lightButtonPropDescriptions';
import { STATUS_PROP_DESCRIPTIONS } from './statusPropDescriptions';
import { TAG_PROP_DESCRIPTIONS } from './tagPropDescriptions';

export const DOCUMENTED_COMPONENTS = [
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
  },
  {
    name: 'Tabs',
    source: 'primitives/navigation/Tabs/Tabs.tsx',
    entryPoint: 'twenty-ui/primitives/navigation',
    slug: 'navigation/tabs',
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
    name: 'Toast',
    source: 'primitives/feedback/Toast/Toast.tsx',
    entryPoint: 'twenty-ui/primitives/feedback',
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
] as const;
