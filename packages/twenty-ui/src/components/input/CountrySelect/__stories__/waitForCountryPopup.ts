import { expect, waitFor, within } from 'storybook/test';

export const waitForCountryPopup = async (canvasElement: HTMLElement) => {
  const popup = await within(canvasElement.ownerDocument.body).findByRole(
    'dialog',
  );

  await waitFor(() => expect(popup).toBeVisible());
  await waitFor(() =>
    expect(within(popup).getByRole('searchbox')).toHaveFocus(),
  );

  return popup;
};
