import { type Meta, type StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { ComponentDecorator } from '@ui/testing';

import { EmojiPickerExample } from './EmojiPickerExample';
import { mockEmojiPickerStoryData } from './mockEmojiPickerStoryData';

const meta: Meta<typeof EmojiPickerExample> = {
  id: 'ui-input-emojipicker',
  title: 'UI/Components/Input/EmojiPicker',
  component: EmojiPickerExample,
  decorators: [ComponentDecorator],
  beforeEach: () => mockEmojiPickerStoryData(),
  args: {
    searchLabel: 'Search emojis',
    loadingLabel: 'Loading emojis',
    emptyLabel: 'No emoji found',
    onEmojiSelect: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof EmojiPickerExample>;

export const Display: Story = {};

export const Dark: Story = {
  globals: { colorScheme: 'dark' },
};
