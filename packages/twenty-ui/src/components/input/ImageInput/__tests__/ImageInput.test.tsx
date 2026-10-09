import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ChangeEvent, createRef } from 'react';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';

import { type ImageInputProps } from '@ui/components/input';

import { ImageInput } from '../ImageInput';

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
      Extract<
        keyof ImageInputProps,
        | 'onUpload'
        | 'fileInputProps'
        | 'children'
        | 'dangerouslySetInnerHTML'
        | 'type'
        | 'multiple'
        | 'value'
        | 'defaultValue'
        | 'hidden'
      >
    >().toEqualTypeOf<never>();
    expectTypeOf<ImageInputProps['accept']>().toEqualTypeOf<
      string | undefined
    >();
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
        <label htmlFor="image-file">Workspace image file</label>
        <ImageInput
          ref={rootRef}
          render={
            <div
              id="image-root"
              title="Workspace image"
              onChange={onRootChange}
            />
          }
          className="custom-root"
          style={{ padding: '4px' }}
          dir="rtl"
          inputRef={fileInputRef}
          id="image-file"
          name="workspaceImage"
          form="workspace-form"
          accept="image/png"
          capture="environment"
          required
          onChange={onFileChange}
          onFileSelect={vi.fn()}
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
    expect(rootRef.current).toHaveStyle({ padding: '4px' });
    expect(rootRef.current).toHaveAttribute('dir', 'rtl');
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
    expect(fileInput).toHaveAttribute('dir', 'rtl');
    expect(fileInput).not.toHaveClass('custom-root');
    expect(fileInput).not.toHaveStyle({ padding: '4px' });
    expect(
      screen.getByLabelText('Workspace image file', { selector: 'input' }),
    ).toBe(fileInput);
    expect(fileInput).not.toHaveAttribute('multiple');
    expect(fileInput).not.toBeVisible();

    await user.upload(fileInput, file);

    expect(onRootChange).toHaveReturnedWith(rootRef.current);
    expect(onFileChange).toHaveReturnedWith(fileInput);

    unmount();

    expect(rootRef.current).toBeNull();
    expect(cleanupFileInputRef).toHaveBeenCalledOnce();
  });

  it('composes root props and refs through a render function', () => {
    const rootRef = createRef<HTMLDivElement>();

    render(
      <ImageInput
        ref={rootRef}
        id="workspace-file"
        className="custom-root"
        style={{ padding: '4px' }}
        render={(rootProps) => <div {...rootProps} data-testid="image-root" />}
      />,
    );

    const root = screen.getByTestId('image-root');

    expect(rootRef.current).toBe(root);
    expect(root).toHaveClass('custom-root');
    expect(root).toHaveStyle({ padding: '4px' });
    expect(root).not.toHaveAttribute('id');
    expect(
      screen.getByLabelText('Upload', { selector: 'input' }),
    ).toHaveAttribute('id', 'workspace-file');
  });

  it('exposes the selected file to the native event before reset and supports repeated selection', async () => {
    const user = userEvent.setup();
    const onFileChange = vi.fn((event: ChangeEvent<HTMLInputElement>) => ({
      file: event.currentTarget.files?.[0],
      value: event.currentTarget.value,
    }));
    const onFileSelect = vi.fn(readFileText);

    render(<ImageInput onFileSelect={onFileSelect} onChange={onFileChange} />);

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

    render(<ImageInput {...broaderInputProps} onFileSelect={onFileSelect} />);

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
      dangerouslySetInnerHTML: { __html: 'Unexpected input markup' },
      type: 'text',
      hidden: false,
      value: 'controlled-file.png',
      defaultValue: 'initial-file.png',
    };

    render(<ImageInput {...broaderInputProps} onFileSelect={onFileSelect} />);

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

    render(<ImageInput onFileSelect={onFileSelect} onChange={onFileChange} />);

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

  it('keeps keyboard removal usable when no file selection handler is provided', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();

    render(<ImageInput src="workspace.png" onRemove={onRemove} />);

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
          aria-describedby="image-format"
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
          aria-label="Workspace image file"
          aria-describedby="image-format"
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
        'PNG images only. Choose a square image. The image could not be saved.',
      );
    }
  });
});
