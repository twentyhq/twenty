import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type MockInstance, vi } from 'vitest';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { Field } from '@ui/input/Field/Field';

import { Textarea } from '../Textarea';
import styles from '../Textarea.module.scss';

runComponentConformance({
  name: 'Textarea',
  element: <Textarea />,
  refInstanceOf: HTMLTextAreaElement,
  ownClassName: styles.textarea,
  renderPropTagName: 'textarea',
});

describe('Textarea', () => {
  it('updates its value and reports it when uncontrolled', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <Textarea
        defaultValue="a"
        onValueChange={onValueChange}
        aria-label="Notes"
      />,
    );

    const textarea = screen.getByRole('textbox', { name: 'Notes' });

    await user.type(textarea, 'b');

    expect(textarea).toHaveValue('ab');
    expect(onValueChange).toHaveBeenCalledWith(
      'ab',
      expect.objectContaining({ reason: 'none' }),
    );
  });

  it('keeps the rendered value controlled by the value prop', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <Textarea value="a" onValueChange={onValueChange} aria-label="Notes" />,
    );

    const textarea = screen.getByRole('textbox', { name: 'Notes' });

    await user.type(textarea, 'b');

    expect(onValueChange).toHaveBeenCalledWith('ab', expect.anything());
    expect(textarea).toHaveValue('a');
  });

  it('passes rows through and applies the size', () => {
    render(<Textarea aria-label="Notes" rows={5} size="sm" />);

    const textarea = screen.getByRole('textbox', { name: 'Notes' });

    expect(textarea).toHaveAttribute('rows', '5');
    expect(textarea).toHaveClass(styles.sm);
  });

  it('resolves a function className against the field state', () => {
    render(
      <Field.Root invalid>
        <Textarea
          aria-label="Notes"
          className={(state) => (state.valid === false ? 'invalid' : 'valid')}
        />
      </Field.Root>,
    );

    const textarea = screen.getByRole('textbox', { name: 'Notes' });

    expect(textarea).toHaveClass(styles.textarea, 'invalid');
    expect(textarea).not.toHaveClass('valid');
  });

  it('exposes maxRows as a custom property', () => {
    render(<Textarea aria-label="Notes" maxRows={4} />);

    expect(
      screen
        .getByRole('textbox', { name: 'Notes' })
        .style.getPropertyValue('--tw-textarea-max-rows'),
    ).toBe('4');
  });

  it('runs the cleanup of a callback ref on unmount', () => {
    const refCleanup = vi.fn();
    const callbackRef = vi.fn(() => refCleanup);

    const { unmount } = render(
      <Textarea aria-label="Notes" ref={callbackRef} />,
    );

    expect(callbackRef).toHaveBeenCalledWith(
      screen.getByRole('textbox', { name: 'Notes' }),
    );

    unmount();

    expect(refCleanup).toHaveBeenCalledTimes(1);
    expect(callbackRef).toHaveBeenCalledTimes(1);
  });

  describe('autoResize', () => {
    let scrollHeightSpy: MockInstance<() => number>;

    beforeEach(() => {
      scrollHeightSpy = vi
        .spyOn(Element.prototype, 'scrollHeight', 'get')
        .mockReturnValue(40);
    });

    afterEach(() => {
      scrollHeightSpy.mockRestore();
    });

    it('sizes the textarea to its content on mount and while typing', async () => {
      const user = userEvent.setup();

      render(<Textarea aria-label="Notes" autoResize />);

      const textarea = screen.getByRole('textbox', { name: 'Notes' });

      expect(textarea).toHaveAttribute('data-auto-resize');
      expect(textarea.style.blockSize).toBe('40px');

      scrollHeightSpy.mockReturnValue(56);

      await user.type(textarea, 'a');

      expect(textarea.style.blockSize).toBe('56px');
    });

    it('resizes when a controlled value changes', () => {
      const onValueChange = vi.fn();
      const { rerender } = render(
        <Textarea
          aria-label="Notes"
          autoResize
          value="a"
          onValueChange={onValueChange}
        />,
      );

      scrollHeightSpy.mockReturnValue(72);

      rerender(
        <Textarea
          aria-label="Notes"
          autoResize
          value={'a\nb'}
          onValueChange={onValueChange}
        />,
      );

      expect(
        screen.getByRole('textbox', { name: 'Notes' }).style.blockSize,
      ).toBe('72px');
    });

    it('keeps the height when a controlled parent rejects the edit', async () => {
      const user = userEvent.setup();

      render(
        <Textarea
          aria-label="Notes"
          autoResize
          value="a"
          onValueChange={() => undefined}
        />,
      );

      const textarea = screen.getByRole('textbox', { name: 'Notes' });

      scrollHeightSpy.mockReturnValue(56);

      await user.type(textarea, 'b');

      expect(textarea).toHaveValue('a');
      expect(textarea.style.blockSize).toBe('40px');
    });

    it('measures again when rows changes', () => {
      const { rerender } = render(
        <Textarea aria-label="Notes" autoResize rows={1} />,
      );

      scrollHeightSpy.mockReturnValue(56);

      rerender(<Textarea aria-label="Notes" autoResize rows={3} />);

      expect(
        screen.getByRole('textbox', { name: 'Notes' }).style.blockSize,
      ).toBe('56px');
    });

    it('clears the inline height when autoResize is turned off', () => {
      const { rerender } = render(<Textarea aria-label="Notes" autoResize />);

      const textarea = screen.getByRole('textbox', { name: 'Notes' });

      expect(textarea.style.blockSize).toBe('40px');

      rerender(<Textarea aria-label="Notes" autoResize={false} />);

      expect(textarea.style.blockSize).toBe('');
    });

    it('restores the consumer block size when autoResize is turned off', () => {
      const { rerender } = render(
        <Textarea aria-label="Notes" autoResize style={{ blockSize: 80 }} />,
      );

      const textarea = screen.getByRole('textbox', { name: 'Notes' });

      expect(textarea.style.blockSize).toBe('40px');

      rerender(
        <Textarea
          aria-label="Notes"
          autoResize={false}
          style={{ blockSize: 80 }}
        />,
      );

      expect(textarea.style.blockSize).toBe('80px');
    });
  });

  it('is labelled and focused by Field.Label inside Field.Root', async () => {
    const user = userEvent.setup();

    render(
      <Field.Root>
        <Field.Label>Notes</Field.Label>
        <Textarea />
      </Field.Root>,
    );

    const textarea = screen.getByRole('textbox', { name: 'Notes' });

    await user.click(screen.getByText('Notes'));

    expect(textarea).toHaveFocus();
  });

  it('reflects the invalid state of its Field.Root', () => {
    render(
      <Field.Root invalid>
        <Textarea aria-label="Notes" />
      </Field.Root>,
    );

    const textarea = screen.getByRole('textbox', { name: 'Notes' });

    expect(textarea).toHaveAttribute('aria-invalid', 'true');
    expect(textarea).toHaveAttribute('data-invalid');
  });
});
