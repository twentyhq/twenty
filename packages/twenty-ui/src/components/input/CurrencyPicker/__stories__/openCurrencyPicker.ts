import { expect, userEvent, waitFor, within } from 'storybook/test';

export const openCurrencyPicker = async ({
  canvasElement,
  triggerLabel = 'Currency',
}: {
  canvasElement: HTMLElement;
  triggerLabel?: string;
}) => {
  const trigger = within(canvasElement).getByRole('button', {
    name: triggerLabel,
  });

  await userEvent.click(trigger);

  const dialog = await within(canvasElement.ownerDocument.body).findByRole(
    'dialog',
    { name: triggerLabel },
  );
  const search = within(dialog).getByRole('searchbox');

  await waitFor(() => expect(dialog).toBeVisible());
  await waitFor(() => expect(search).toHaveFocus());

  return { trigger, dialog, search };
};
