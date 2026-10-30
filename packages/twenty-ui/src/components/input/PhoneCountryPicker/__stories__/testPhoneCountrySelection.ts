import { expect, userEvent, waitFor, within } from 'storybook/test';

import { type PhoneCountryPickerRootProps } from '../types/PhoneCountryPickerRootProps';
import { openPhoneCountryPicker } from './openPhoneCountryPicker';

export const testPhoneCountrySelection = async ({
  canvasElement,
  args,
}: {
  canvasElement: HTMLElement;
  args: Pick<PhoneCountryPickerRootProps, 'onValueChange'>;
}) => {
  const { dialog, trigger } = await openPhoneCountryPicker({ canvasElement });
  const canada = within(dialog).getByRole('option', { name: 'Canada (+1)' });

  await expect(trigger).toHaveAccessibleDescription('France');
  await expect(within(dialog).getByRole('listbox')).toBeVisible();
  await expect(
    within(dialog).getByRole('option', { name: 'France (+33)' }),
  ).toHaveAttribute('aria-selected', 'true');
  await userEvent.click(canada);
  await expect(args.onValueChange).toHaveBeenCalledOnce();
  await expect(args.onValueChange).toHaveBeenLastCalledWith(
    'CA',
    expect.objectContaining({
      reason: 'item-press',
      trigger: canada,
      isCanceled: false,
    }),
  );
  await waitFor(() => expect(dialog).not.toBeInTheDocument());
  await expect(trigger).toHaveAccessibleDescription('Canada');
  await expect(
    within(canvasElement).getByRole('status', {
      name: 'Phone country selection',
    }),
  ).toHaveTextContent('Canada (+1)');
  const reopened = await openPhoneCountryPicker({ canvasElement });

  await expect(
    within(reopened.dialog).getAllByRole('option')[0],
  ).toHaveAccessibleName('Canada (+1)');
  await expect(
    within(reopened.dialog).getByRole('option', { name: 'Canada (+1)' }),
  ).toHaveAttribute('aria-selected', 'true');
  await userEvent.keyboard('{Escape}');
};
