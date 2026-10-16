import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';

import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

import { ImageInput } from '../ImageInput';
import { IMAGE_INPUT_PREVIEW_URL } from './imageInputPreviewUrl';

const meta: Meta<typeof ImageInput> = {
  id: 'ui-input-imageinput',
  title: 'UI/Components/Input/ImageInput',
  component: ImageInput,
  args: { onFileSelect: fn(), onRemove: fn() },
  decorators: [ComponentDecorator],
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
};

export default meta;
type Story = StoryObj<typeof ImageInput>;

export const Display: Story = {
  args: { helperText: 'Choose a square image for your workspace.' },
  argTypes: {
    src: { control: false },
    onFileSelect: { control: false },
    onRemove: { control: false },
  },
  render: function Render(args) {
    const [src, setSrc] = useState<string>();

    return (
      <ImageInput
        {...args}
        src={src}
        onFileSelect={(file) => {
          const reader = new FileReader();
          reader.onload = () => {
            setSrc(reader.result?.toString());
          };
          reader.readAsDataURL(file);
        }}
        onRemove={() => setSrc(undefined)}
      />
    );
  },
};

export const Default: Story = {};

export const WithPicture: Story = {
  args: { src: IMAGE_INPUT_PREVIEW_URL },
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
  args: {
    src: IMAGE_INPUT_PREVIEW_URL,
    helperText: 'Choose a square image for your workspace.',
  },
  globals: { colorScheme: 'dark' },
};

export const RightToLeft: Story = {
  args: {
    src: IMAGE_INPUT_PREVIEW_URL,
    helperText: 'Choose a square image for your workspace.',
    dir: 'rtl',
  },
};
