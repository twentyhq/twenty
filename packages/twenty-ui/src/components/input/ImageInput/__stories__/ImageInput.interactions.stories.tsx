import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '@ui/primitives/input/Button/Button';
import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { ImageInput } from '../ImageInput';
import { IMAGE_INPUT_PREVIEW_URL } from './imageInputPreviewUrl';
import { ImageInputPreviewChangesExample } from './ImageInputPreviewChangesExample';

const getFileInput = (canvasElement: HTMLElement) => {
  const fileInput =
    canvasElement.querySelector<HTMLInputElement>('input[type="file"]');

  if (!isDefined(fileInput)) {
    throw new Error('The image selector must contain a file input.');
  }

  return fileInput;
};

const meta: Meta<typeof ImageInput> = {
  id: 'ui-input-imageinput-interactions',
  title: 'UI/Components/Input/ImageInput/Interactions',
  component: ImageInput,
  tags: ['!autodocs'],
  decorators: [ComponentDecorator],
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: { onUpload: fn(), onRemove: fn(), onAbort: fn() },
};

export default meta;
type Story = StoryObj<typeof ImageInput>;

export const NativeButtonsInForm: Story = {
  args: { src: IMAGE_INPUT_PREVIEW_URL },
  render: (args) => (
    <form
      aria-label="Workspace image"
      onSubmit={(event) => event.preventDefault()}
    >
      <ImageInput {...args} />
      <Button type="submit">Save workspace</Button>
    </form>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const previewButton = canvas.getByRole('presentation').closest('button');
    const uploadButton = canvas.getByText('Upload').closest('button');
    if (!isDefined(previewButton) || !isDefined(uploadButton)) {
      throw new Error('The image selector must provide both upload buttons.');
    }

    const removeButton = canvas.getByRole('button', { name: 'Remove' });
    const fileInput = getFileInput(canvasElement);
    const form = canvas.getByRole('form', { name: 'Workspace image' });
    const onSubmit = fn();
    const onFilePicker = fn((event: Event) => event.preventDefault());
    form.addEventListener('submit', onSubmit);
    fileInput.addEventListener('click', onFilePicker);

    try {
      await userEvent.click(previewButton);
      await expect(onFilePicker).toHaveBeenCalledTimes(1);
      previewButton.focus();
      await userEvent.keyboard('{Enter}');
      await userEvent.keyboard(' ');
      await expect(onFilePicker).toHaveBeenCalledTimes(3);
      await userEvent.click(uploadButton);
      await expect(onFilePicker).toHaveBeenCalledTimes(4);
      await userEvent.click(removeButton);
      removeButton.focus();
      await userEvent.keyboard('{Enter}');
      await expect(args.onRemove).toHaveBeenCalledTimes(2);
      await expect(onSubmit).not.toHaveBeenCalled();
      await expect(args.onUpload).not.toHaveBeenCalled();
      await userEvent.click(
        canvas.getByRole('button', { name: 'Save workspace' }),
      );
      await expect(onSubmit).toHaveBeenCalledOnce();
    } finally {
      form.removeEventListener('submit', onSubmit);
      fileInput.removeEventListener('click', onFilePicker);
    }
  },
};

export const FileSelectionAndRetry: Story = {
  args: { accept: 'image/png' },
  play: async ({ canvasElement, args }) => {
    const fileInput = getFileInput(canvasElement);
    const file = new File(['image'], 'workspace.png', { type: 'image/png' });

    await expect(fileInput).not.toBeVisible();
    await expect(fileInput).toHaveAttribute('accept', 'image/png');
    await expect(fileInput).not.toHaveAttribute('multiple');
    await userEvent.upload(fileInput, file);
    await expect(args.onUpload).toHaveBeenCalledOnce();
    await expect(args.onUpload).toHaveBeenCalledWith(file);
    await expect(fileInput).toHaveValue('');
    await userEvent.upload(fileInput, file);
    await expect(args.onUpload).toHaveBeenCalledTimes(2);
    await expect(args.onUpload).toHaveBeenLastCalledWith(file);
    fileInput.dispatchEvent(new Event('cancel', { bubbles: true }));
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    await expect(args.onUpload).toHaveBeenCalledTimes(2);
  },
};

export const Disabled: Story = {
  args: { disabled: true, src: IMAGE_INPUT_PREVIEW_URL },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const fileInput = getFileInput(canvasElement);
    const onFilePicker = fn();
    fileInput.addEventListener('click', onFilePicker);

    try {
      for (const button of canvas.getAllByRole('button')) {
        await expect(button).toBeDisabled();
        await userEvent.click(button);
      }
      await expect(fileInput).toBeDisabled();
      await expect(onFilePicker).not.toHaveBeenCalled();
      await expect(args.onUpload).not.toHaveBeenCalled();
      await expect(args.onRemove).not.toHaveBeenCalled();
    } finally {
      fileInput.removeEventListener('click', onFilePicker);
    }
  },
};

export const UploadingWithoutAbort: Story = {
  args: { isUploading: true, src: IMAGE_INPUT_PREVIEW_URL, onAbort: undefined },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    for (const button of canvas.getAllByRole('button')) {
      await expect(button).toHaveAttribute('aria-disabled', 'true');
      button.focus();
      await expect(button).toHaveFocus();
      await userEvent.click(button);
    }
    await expect(getFileInput(canvasElement)).toBeDisabled();
    await expect(
      canvas.queryByRole('button', { name: 'Abort' }),
    ).not.toBeInTheDocument();
    await expect(args.onUpload).not.toHaveBeenCalled();
    await expect(args.onRemove).not.toHaveBeenCalled();
  },
};

export const AbortFirstUpload: Story = {
  args: { isUploading: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const abortButton = canvas.getByRole('button', { name: 'Abort' });

    await expect(
      canvas.getByRole('button', { name: 'Upload' }),
    ).toHaveAttribute('aria-disabled', 'true');
    await expect(canvas.getByRole('button', { name: 'Remove' })).toBeDisabled();
    await expect(abortButton).toBeEnabled();
    abortButton.focus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onAbort).toHaveBeenCalledOnce();
    await expect(args.onUpload).not.toHaveBeenCalled();
    await expect(args.onRemove).not.toHaveBeenCalled();
  },
};

export const DisabledUploadCannotAbort: Story = {
  args: { isUploading: true, disabled: true },
  play: async ({ canvasElement, args }) => {
    const abortButton = within(canvasElement).getByRole('button', {
      name: 'Abort',
    });

    await expect(abortButton).toBeDisabled();
    await userEvent.click(abortButton);
    await expect(args.onAbort).not.toHaveBeenCalled();
  },
};

export const LabelsAndError: Story = {
  args: {
    uploadLabel: 'Choose workspace image',
    removeLabel: 'Delete workspace image',
    helperText: 'Choose an image for your workspace.',
    errorMessage: 'This image exceeds your workspace limit.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const button of canvas.getAllByRole('button', {
      name: 'Choose workspace image',
    })) {
      await expect(button).toHaveAccessibleDescription(
        'Choose an image for your workspace. This image exceeds your workspace limit.',
      );
    }
    await expect(canvas.getByRole('alert')).toHaveTextContent(
      'This image exceeds your workspace limit.',
    );
    await expect(
      canvas.getByRole('button', { name: 'Delete workspace image' }),
    ).toBeDisabled();
  },
};

export const PreviewFallbackAndRecovery: Story = {
  render: (args) => <ImageInputPreviewChangesExample {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const previewButton = canvas.getByRole('presentation').closest('button');

    if (!isDefined(previewButton)) {
      throw new Error('The image preview must provide an upload button.');
    }

    await expect(await canvas.findByRole('presentation')).toBeVisible();
    await expect(previewButton).toBeEnabled();
    await expect(canvas.getByRole('button', { name: 'Remove' })).toBeEnabled();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Break preview' }),
    );
    await waitFor(() =>
      expect(canvas.queryByRole('presentation')).not.toBeInTheDocument(),
    );
    await expect(previewButton).toHaveAccessibleName('Upload');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Restore preview' }),
    );
    await expect(await canvas.findByRole('presentation')).toBeVisible();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Clear preview' }),
    );
    await expect(canvas.queryByRole('presentation')).not.toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Remove' })).toBeDisabled();
    await expect(previewButton).toHaveAccessibleName('Upload');
  },
};
