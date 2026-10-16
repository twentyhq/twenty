import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { flushSync } from 'react-dom';
import { expect, fn, spyOn, userEvent, within } from 'storybook/test';

import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { ImageInput } from '../ImageInput';
import { IMAGE_INPUT_PREVIEW_URL } from './imageInputPreviewUrl';

const mockImageReads = () => {
  const readers: FileReader[] = [];
  const readAsDataURL = spyOn(
    FileReader.prototype,
    'readAsDataURL',
  ).mockImplementation(function (this: FileReader) {
    readers.push(this);
  });

  return {
    complete: ({ readIndex, src }: { readIndex: number; src: string }) => {
      const reader = readers[readIndex];

      if (!isDefined(reader)) {
        throw new Error('Select an image before completing its read.');
      }

      Object.defineProperty(reader, 'result', { value: src });
      flushSync(() => {
        reader.dispatchEvent(new ProgressEvent('load'));
      });
    },
    restore: () => readAsDataURL.mockRestore(),
  };
};

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
    const [preview, setPreview] = useState<{
      src?: string;
      reader?: FileReader;
    }>({});

    return (
      <ImageInput
        {...args}
        src={preview.src}
        onFileSelect={(file) => {
          const reader = new FileReader();
          setPreview((current) => ({ src: current.src, reader }));
          reader.onload = () => {
            setPreview((current) => {
              if (current.reader !== reader) {
                return current;
              }

              return { src: reader.result?.toString() };
            });
          };
          reader.readAsDataURL(file);
        }}
        onRemove={() => setPreview({})}
      />
    );
  },
};

export const Default: Story = {};

export const RemovePendingReplacement: Story = {
  ...Display,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const fileInput = canvas.getByLabelText('Upload', { selector: 'input' });
    const imageReads = mockImageReads();

    try {
      await userEvent.upload(
        fileInput,
        new File(['original'], 'original.svg', { type: 'image/svg+xml' }),
      );
      imageReads.complete({ readIndex: 0, src: IMAGE_INPUT_PREVIEW_URL });
      await expect(canvas.getByRole('presentation')).toHaveAttribute(
        'src',
        IMAGE_INPUT_PREVIEW_URL,
      );

      await userEvent.upload(
        fileInput,
        new File(['replacement'], 'replacement.svg', { type: 'image/svg+xml' }),
      );
      await userEvent.click(canvas.getByRole('button', { name: 'Remove' }));
      imageReads.complete({ readIndex: 1, src: IMAGE_INPUT_PREVIEW_URL });

      await expect(canvas.queryByRole('presentation')).not.toBeInTheDocument();
      await expect(
        canvas.getByRole('button', { name: 'Remove' }),
      ).toBeDisabled();
    } finally {
      imageReads.restore();
    }
  },
};

export const LatestSelectionWins: Story = {
  ...Display,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const fileInput = canvas.getByLabelText('Upload', { selector: 'input' });
    const imageReads = mockImageReads();
    const latestPreviewUrl = `${IMAGE_INPUT_PREVIEW_URL}#latest`;

    try {
      await userEvent.upload(
        fileInput,
        new File(['first'], 'first.svg', { type: 'image/svg+xml' }),
      );
      await userEvent.upload(
        fileInput,
        new File(['latest'], 'latest.svg', { type: 'image/svg+xml' }),
      );
      imageReads.complete({ readIndex: 1, src: latestPreviewUrl });
      await expect(canvas.getByRole('presentation')).toHaveAttribute(
        'src',
        latestPreviewUrl,
      );

      imageReads.complete({ readIndex: 0, src: IMAGE_INPUT_PREVIEW_URL });

      await expect(canvas.getByRole('presentation')).toHaveAttribute(
        'src',
        latestPreviewUrl,
      );
    } finally {
      imageReads.restore();
    }
  },
};

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
