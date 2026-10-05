import { expect, userEvent, waitFor, within } from 'storybook/test';

export const openPhoneCountryPicker = async ({
  canvasElement,
  label = 'Phone country',
}: {
  canvasElement: HTMLElement;
  label?: string;
}) => {
  const trigger = within(canvasElement).getByRole('button', { name: label });

  await userEvent.click(trigger);
  const dialog = await within(canvasElement.ownerDocument.body).findByRole(
    'dialog',
    { name: `${label} choices` },
  );
  const search = within(dialog).getByRole('searchbox');

  await waitFor(() => expect(dialog).toBeVisible());
  await waitFor(() => expect(search).toHaveFocus());

  return { dialog, search, trigger };
};
