import { expect, waitFor, within } from 'storybook/test';

export const waitForSelectPopup = async (canvasElement: HTMLElement) => {
  const popup = await within(canvasElement.ownerDocument.body).findByRole(
    'listbox',
  );

  await waitFor(() => {
    expect(popup).toBeVisible();
    expect(getComputedStyle(popup).opacity).toBe('1');
  });

  return popup;
};
