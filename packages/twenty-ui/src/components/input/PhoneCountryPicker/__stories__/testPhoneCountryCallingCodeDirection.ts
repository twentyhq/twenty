import { expect, userEvent, waitFor, within } from 'storybook/test';

import { openPhoneCountryPicker } from './openPhoneCountryPicker';

export const testPhoneCountryCallingCodeDirection = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  const { dialog, trigger } = await openPhoneCountryPicker({ canvasElement });

  await expect(getComputedStyle(trigger).direction).toBe('rtl');
  await expect(getComputedStyle(dialog).direction).toBe('rtl');
  const option = within(dialog).getByRole('option', {
    name: 'United Kingdom (+44)',
  });
  const callingCode = within(option).getByText('+44');

  await expect(callingCode).toHaveAttribute('dir', 'ltr');
  await expect(getComputedStyle(callingCode).direction).toBe('ltr');
  await userEvent.click(option);
  await waitFor(() => expect(dialog).not.toBeInTheDocument());
  await expect(trigger).toHaveAccessibleDescription('United Kingdom');
};
