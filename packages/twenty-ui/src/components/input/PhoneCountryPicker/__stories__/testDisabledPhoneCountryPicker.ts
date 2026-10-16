import { expect, userEvent, within } from 'storybook/test';

import { type PhoneCountryPickerRootProps } from '../types/PhoneCountryPickerRootProps';

export const testDisabledPhoneCountryPicker = async ({
  canvasElement,
  args,
}: {
  canvasElement: HTMLElement;
  args: Pick<PhoneCountryPickerRootProps, 'onValueChange'>;
}) => {
  const disabledTrigger = within(canvasElement).getByRole('button', {
    name: 'Phone country',
  });

  await expect(disabledTrigger).toBeDisabled();
  await userEvent.click(disabledTrigger);
  await expect(
    within(canvasElement.ownerDocument.body).queryByRole('dialog'),
  ).not.toBeInTheDocument();
  await expect(args.onValueChange).not.toHaveBeenCalled();
};
