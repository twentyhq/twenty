import { type Meta, type StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

import { ImageInput } from '../ImageInput';
import { IMAGE_INPUT_PREVIEW_URL } from './imageInputPreviewUrl';

const meta: Meta<typeof ImageInput> = {
  id: 'ui-input-imageinput',
  title: 'UI/Components/Input/ImageInput',
  component: ImageInput,
  args: { onUpload: fn(), onRemove: fn() },
  decorators: [ComponentDecorator],
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
};

export default meta;
type Story = StoryObj<typeof ImageInput>;

export const Default: Story = {};

export const WithPicture: Story = {
  args: { src: IMAGE_INPUT_PREVIEW_URL },
};

export const WithHelperText: Story = {
  args: {
    src: IMAGE_INPUT_PREVIEW_URL,
    helperText: 'Choose a square image for your workspace.',
  },
};

export const Disabled: Story = {
  args: { disabled: true, src: IMAGE_INPUT_PREVIEW_URL },
};

export const Uploading: Story = {
  args: { isUploading: true, onAbort: fn() },
};

export const WithError: Story = {
  args: {
    helperText: 'Choose a square image for your workspace.',
    errorMessage: 'The image could not be saved. Please try again.',
  },
};

export const Dark: Story = {
  ...WithHelperText,
  globals: { colorScheme: 'dark' },
};

export const RightToLeft: Story = {
  args: {
    src: IMAGE_INPUT_PREVIEW_URL,
    helperText: 'Choose a square image for your workspace.',
    dir: 'rtl',
  },
};
