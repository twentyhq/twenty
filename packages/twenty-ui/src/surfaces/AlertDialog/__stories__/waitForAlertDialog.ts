import { expect, waitFor, within } from 'storybook/test';

export const waitForAlertDialog = async (canvasElement: HTMLElement) => {
  const dialog = await within(canvasElement.ownerDocument.body).findByRole(
    'alertdialog',
  );

  await waitFor(() => {
    expect(dialog).toBeVisible();
    expect(getComputedStyle(dialog).opacity).toBe('1');
  });

  return dialog;
};
