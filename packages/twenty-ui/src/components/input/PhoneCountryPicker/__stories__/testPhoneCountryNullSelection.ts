import { expect, userEvent, waitFor, within } from 'storybook/test';

import { type PhoneCountryPickerRootProps } from '../types/PhoneCountryPickerRootProps';
import { openPhoneCountryPicker } from './openPhoneCountryPicker';

export const testPhoneCountryNullSelection = async ({
  canvasElement,
  args,
}: {
  canvasElement: HTMLElement;
  args: Pick<PhoneCountryPickerRootProps, 'onValueChange'>;
}) => {
  const { dialog, trigger } = await openPhoneCountryPicker({ canvasElement });

  await expect(trigger).not.toHaveAccessibleDescription();

  for (const option of within(dialog).getAllByRole('option')) {
    await expect(option).toHaveAttribute('aria-selected', 'false');
  }

  await userEvent.click(
    within(dialog).getByRole('option', { name: 'United States (+1)' }),
  );
  await waitFor(() => expect(dialog).not.toBeInTheDocument());
  await expect(trigger).toHaveAccessibleDescription('United States');
  await expect(args.onValueChange).toHaveBeenCalledOnce();
  await expect(args.onValueChange).toHaveBeenLastCalledWith(
    'US',
    expect.anything(),
  );
};
