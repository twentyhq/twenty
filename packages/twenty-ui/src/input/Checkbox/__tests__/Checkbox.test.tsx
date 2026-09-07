import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Checkbox } from '../Checkbox';

describe('Checkbox', () => {
  const originalPointerEvent = window.PointerEvent;

  beforeAll(() => {
    Object.defineProperty(window, 'PointerEvent', {
      configurable: true,
      value: MouseEvent,
    });
  });

  afterAll(() => {
    Object.defineProperty(window, 'PointerEvent', {
      configurable: true,
      value: originalPointerEvent,
    });
  });

  it('keeps the rendered state controlled by the checked prop', async () => {
    const user = userEvent.setup();
    const onCheckedChange = jest.fn();
    const { rerender } = render(
      <Checkbox
        checked={false}
        onCheckedChange={onCheckedChange}
        aria-label="Controlled checkbox"
      />,
    );
    const checkbox = screen.getByRole('checkbox', {
      name: 'Controlled checkbox',
    });

    await user.click(checkbox);

    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(checkbox).not.toBeChecked();

    rerender(
      <Checkbox
        checked
        onCheckedChange={onCheckedChange}
        aria-label="Controlled checkbox"
      />,
    );

    expect(checkbox).toBeChecked();
  });
});
