import { expect, waitFor, within } from 'storybook/test';

export const waitForDialog = async (canvasElement: HTMLElement) => {
  const dialog = await within(canvasElement.ownerDocument.body).findByRole(
    'dialog',
  );

  await waitFor(() => {
    expect(dialog).toBeVisible();
    expect(getComputedStyle(dialog).opacity).toBe('1');
  });

  return dialog;
};
