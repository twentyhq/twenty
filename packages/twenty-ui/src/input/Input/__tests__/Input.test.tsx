import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { Field } from '@ui/input/Field/Field';

import { Input } from '../Input';
import styles from '../Input.module.scss';

runComponentConformance({
  name: 'Input',
  element: <Input />,
  refInstanceOf: HTMLInputElement,
  ownClassName: styles.input,
  renderPropTagName: 'input',
});

describe('Input', () => {
  it('updates its value and reports it when uncontrolled', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <Input
        defaultValue="a"
        onValueChange={onValueChange}
        aria-label="Name"
      />,
    );

    const input = screen.getByRole('textbox', { name: 'Name' });

    await user.type(input, 'b');

    expect(input).toHaveValue('ab');
    expect(onValueChange).toHaveBeenCalledWith(
      'ab',
      expect.objectContaining({ reason: 'none' }),
    );
  });

  it('keeps the rendered value controlled by the value prop', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(<Input value="a" onValueChange={onValueChange} aria-label="Name" />);

    const input = screen.getByRole('textbox', { name: 'Name' });

    await user.type(input, 'b');

    expect(onValueChange).toHaveBeenCalledWith('ab', expect.anything());
    expect(input).toHaveValue('a');
  });

  it('applies the medium size by default and the small size on demand', () => {
    const { rerender } = render(<Input aria-label="Name" />);

    const input = screen.getByRole('textbox', { name: 'Name' });

    expect(input).toHaveClass(styles.md);

    rerender(<Input aria-label="Name" size="sm" />);

    expect(input).toHaveClass(styles.sm);
    expect(input).not.toHaveClass(styles.md);
  });

  it('is labelled and focused by Field.Label inside Field.Root', async () => {
    const user = userEvent.setup();

    render(
      <Field.Root>
        <Field.Label>Name</Field.Label>
        <Input />
      </Field.Root>,
    );

    const input = screen.getByRole('textbox', { name: 'Name' });

    await user.click(screen.getByText('Name'));

    expect(input).toHaveFocus();
  });

  it('reflects the invalid and disabled state of its Field.Root', () => {
    render(
      <Field.Root invalid disabled>
        <Input aria-label="Name" />
      </Field.Root>,
    );

    const input = screen.getByRole('textbox', { name: 'Name' });

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('data-invalid');
    expect(input).toBeDisabled();
  });
});
