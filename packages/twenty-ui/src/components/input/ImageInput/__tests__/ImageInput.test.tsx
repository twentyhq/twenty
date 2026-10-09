import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ChangeEvent, createRef } from 'react';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';

import {
  type ImageInputFileInputProps,
  type ImageInputProps,
} from '@ui/components/input';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { ImageInput } from '../ImageInput';

runComponentConformance({
  name: 'ImageInput',
  element: <ImageInput />,
  refInstanceOf: HTMLDivElement,
});

const readFileText = (file: File) =>
  new Promise<string | ArrayBuffer | null>((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener('load', () => resolve(reader.result));
    reader.addEventListener('error', () => reject(reader.error));
    reader.readAsText(file);
  });

describe('ImageInput', () => {
  it('excludes obsolete callbacks and component-owned native input options from its public types', () => {
    expectTypeOf<
      Extract<keyof ImageInputProps, 'onUpload' | 'accept'>
    >().toEqualTypeOf<never>();
    expectTypeOf<
      Extract<
        keyof ImageInputFileInputProps,
        'children' | 'type' | 'multiple' | 'value' | 'defaultValue' | 'hidden'
      >
    >().toEqualTypeOf<never>();
  });

  it('forwards separate native props and refs to the root and file control', async () => {
    const user = userEvent.setup();
    const rootRef = createRef<HTMLDivElement>();
    const cleanupFileInputRef = vi.fn();
    const fileInputRef = vi.fn(
      (_fileInput: HTMLInputElement | null) => cleanupFileInputRef,
    );
    const onRootChange = vi.fn(
      (event: ChangeEvent<HTMLDivElement>) => event.currentTarget,
    );
    const onFileChange = vi.fn(
      (event: ChangeEvent<HTMLInputElement>) => event.currentTarget,
    );
    const { unmount } = render(
      <>
        <form aria-label="Workspace" id="workspace-form" />
        <ImageInput
          ref={rootRef}
          id="image-root"
          title="Workspace image"
          className="custom-root"
          onChange={onRootChange}
          onFileSelect={vi.fn()}
          fileInputProps={{
            ref: fileInputRef,
            id: 'image-file',
            name: 'workspaceImage',
            form: 'workspace-form',
            accept: 'image/png',
            capture: 'environment',
            required: true,
            className: 'custom-file',
            onChange: onFileChange,
          }}
        />
      </>,
    );
    const fileInput = screen.getByLabelText<HTMLInputElement>('Upload', {
      selector: 'input',
    });
    const file = new File(['image'], 'workspace.png', { type: 'image/png' });

    expect(rootRef.current).toBeInstanceOf(HTMLDivElement);
    expect(rootRef.current).toHaveAttribute('id', 'image-root');
    expect(rootRef.current).toHaveAttribute('title', 'Workspace image');
    expect(rootRef.current).toHaveClass('custom-root');
    expect(fileInputRef).toHaveBeenCalledWith(fileInput);
    expect(fileInput).toHaveAttribute('id', 'image-file');
    expect(fileInput).toHaveAttribute('name', 'workspaceImage');
    expect(fileInput.form).toBe(
      screen.getByRole('form', { name: 'Workspace' }),
    );
    expect(fileInput).toHaveAttribute('type', 'file');
    expect(fileInput).toHaveAttribute('accept', 'image/png');
    expect(fileInput).toHaveAttribute('capture', 'environment');
    expect(fileInput).toBeRequired();
    expect(fileInput).toHaveClass('custom-file');
    expect(fileInput).not.toHaveAttribute('multiple');
    expect(fileInput).not.toBeVisible();

    await user.upload(fileInput, file);

    expect(onRootChange).toHaveReturnedWith(rootRef.current);
    expect(onFileChange).toHaveReturnedWith(fileInput);

    unmount();

    expect(rootRef.current).toBeNull();
    expect(cleanupFileInputRef).toHaveBeenCalledOnce();
  });

  it('exposes the selected file to the native event before reset and supports repeated selection', async () => {
    const user = userEvent.setup();
    const onFileChange = vi.fn((event: ChangeEvent<HTMLInputElement>) => ({
      file: event.currentTarget.files?.[0],
      value: event.currentTarget.value,
    }));
    const onFileSelect = vi.fn(readFileText);

    render(
      <ImageInput
        onFileSelect={onFileSelect}
        fileInputProps={{ onChange: onFileChange }}
      />,
    );

    const fileInput = screen.getByLabelText<HTMLInputElement>('Upload', {
      selector: 'input',
    });
    const file = new File(['workspace image'], 'workspace.png', {
      type: 'image/png',
      lastModified: 123,
    });

    await user.upload(fileInput, file);

    expect(onFileChange).toHaveReturnedWith({
      file,
      value: 'C:\\fakepath\\workspace.png',
    });
    expect(onFileChange).toHaveBeenCalledBefore(onFileSelect);
    expect(onFileSelect).toHaveBeenCalledWith(file);
    expect(fileInput).toHaveValue('');
    await expect(onFileSelect.mock.results[0]?.value).resolves.toBe(
      'workspace image',
    );

    await user.upload(fileInput, file);

    expect(onFileSelect).toHaveBeenCalledTimes(2);
    expect(onFileSelect).toHaveBeenLastCalledWith(file);
    expect(fileInput).toHaveValue('');
    await expect(onFileSelect.mock.results[1]?.value).resolves.toBe(
      'workspace image',
    );
  });

  it('keeps single-file selection when a broader props object enables multiple files', async () => {
    const user = userEvent.setup();
    const onFileSelect = vi.fn();
    const onFileChange = vi.fn(
      (event: ChangeEvent<HTMLInputElement>) =>
        event.currentTarget.files?.length,
    );
    const broaderInputProps = {
      accept: 'image/png',
      multiple: true,
      onChange: onFileChange,
    };

    render(
      <ImageInput
        onFileSelect={onFileSelect}
        fileInputProps={broaderInputProps}
      />,
    );

    const fileInput = screen.getByLabelText<HTMLInputElement>('Upload', {
      selector: 'input',
    });
    const firstFile = new File(['first'], 'first.png', { type: 'image/png' });
    const secondFile = new File(['second'], 'second.png', {
      type: 'image/png',
    });

    expect(fileInput).not.toHaveAttribute('multiple');

    await user.upload(fileInput, [firstFile, secondFile]);

    expect(onFileChange).toHaveReturnedWith(1);
    expect(onFileSelect).toHaveBeenCalledOnce();
    expect(onFileSelect).toHaveBeenCalledWith(firstFile);
    expect(fileInput).toHaveValue('');
  });

  it('keeps a hidden empty file control when broader props include component-owned options', async () => {
    const user = userEvent.setup();
    const onFileSelect = vi.fn();
    const broaderInputProps = {
      accept: 'image/png',
      children: <span>Unexpected input content</span>,
      type: 'text',
      hidden: false,
      value: 'controlled-file.png',
      defaultValue: 'initial-file.png',
    };

    render(
      <ImageInput
        onFileSelect={onFileSelect}
        fileInputProps={broaderInputProps}
      />,
    );

    const fileInput = screen.getByLabelText<HTMLInputElement>('Upload', {
      selector: 'input',
    });
    const file = new File(['image'], 'workspace.png', { type: 'image/png' });

    expect(fileInput).toHaveAttribute('type', 'file');
    expect(fileInput).toHaveAttribute('hidden');
    expect(fileInput).toHaveValue('');
    expect(
      screen.queryByText('Unexpected input content'),
    ).not.toBeInTheDocument();

    await user.upload(fileInput, file);

    expect(onFileSelect).toHaveBeenCalledWith(file);
    expect(fileInput).toHaveValue('');
  });

  it('does not select a file after cancellation or an empty change event', () => {
    const onFileSelect = vi.fn();
    const onFileChange = vi.fn();

    render(
      <ImageInput
        onFileSelect={onFileSelect}
        fileInputProps={{ onChange: onFileChange }}
      />,
    );

    const fileInput = screen.getByLabelText('Upload', { selector: 'input' });

    fireEvent(fileInput, new Event('cancel', { bubbles: true }));
    fireEvent.change(fileInput);

    expect(onFileChange).toHaveBeenCalledOnce();
    expect(onFileSelect).not.toHaveBeenCalled();
    expect(fileInput).toHaveValue('');
  });

  it.each([
    { state: 'disabled', props: { disabled: true } },
    { state: 'uploading', props: { isUploading: true } },
  ])('ignores file selection while $state', async ({ props }) => {
    const user = userEvent.setup();
    const onFileSelect = vi.fn();

    render(<ImageInput {...props} onFileSelect={onFileSelect} />);

    const fileInput = screen.getByLabelText('Upload', { selector: 'input' });
    const file = new File(['image'], 'workspace.png', { type: 'image/png' });

    expect(fileInput).toBeDisabled();

    await user.upload(fileInput, file);
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(onFileSelect).not.toHaveBeenCalled();
    expect(fileInput).toHaveValue('');
  });

  it('disables file selection without disabling keyboard removal when the file control is disabled', async () => {
    const user = userEvent.setup();
    const onFileSelect = vi.fn();
    const onRemove = vi.fn();

    render(
      <ImageInput
        src="workspace.png"
        onFileSelect={onFileSelect}
        onRemove={onRemove}
        fileInputProps={{ disabled: true }}
      />,
    );

    for (const button of screen.getAllByRole('button', { name: 'Upload' })) {
      expect(button).toBeDisabled();
    }

    expect(
      screen.getByLabelText('Upload', { selector: 'input' }),
    ).toBeDisabled();

    await user.tab();

    expect(screen.getByRole('button', { name: 'Remove' })).toHaveFocus();

    await user.keyboard('{Enter}');

    expect(onRemove).toHaveBeenCalledOnce();
    expect(onFileSelect).not.toHaveBeenCalled();
  });

  it('provides a default file label and merges native descriptions with helper text and errors', () => {
    const { rerender } = render(
      <>
        <span id="image-format">PNG images only.</span>
        <ImageInput
          uploadLabel="Choose workspace image"
          helperText="Choose a square image."
          errorMessage="The image could not be saved."
          onFileSelect={vi.fn()}
          fileInputProps={{ 'aria-describedby': 'image-format' }}
        />
      </>,
    );
    const defaultFileInput = screen.getByLabelText('Choose workspace image', {
      selector: 'input',
    });

    expect(defaultFileInput).toHaveAttribute(
      'aria-label',
      'Choose workspace image',
    );
    expect(defaultFileInput).toHaveAccessibleDescription(
      'PNG images only. Choose a square image. The image could not be saved.',
    );

    rerender(
      <>
        <span id="image-format">PNG images only.</span>
        <ImageInput
          uploadLabel="Choose workspace image"
          helperText="Choose a square image."
          errorMessage="The image could not be saved."
          onFileSelect={vi.fn()}
          fileInputProps={{
            'aria-label': 'Workspace image file',
            'aria-describedby': 'image-format',
          }}
        />
      </>,
    );

    expect(
      screen.getByLabelText('Workspace image file', { selector: 'input' }),
    ).toHaveAccessibleDescription(
      'PNG images only. Choose a square image. The image could not be saved.',
    );

    for (const button of screen.getAllByRole('button', {
      name: 'Choose workspace image',
    })) {
      expect(button).toHaveAccessibleDescription(
        'Choose a square image. The image could not be saved.',
      );
    }
  });
});
