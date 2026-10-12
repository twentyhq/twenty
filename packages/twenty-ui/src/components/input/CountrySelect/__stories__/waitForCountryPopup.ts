import { expect, waitFor, within } from 'storybook/test';

export const waitForCountryPopup = async ({
  canvasElement,
  name = 'Country',
}: {
  canvasElement: HTMLElement;
  name?: string;
}) => {
  const popup = await within(canvasElement.ownerDocument.body).findByRole(
    'dialog',
    { name },
  );

  await waitFor(() => expect(popup).toBeVisible());
  await waitFor(() =>
    expect(within(popup).getByRole('searchbox')).toHaveFocus(),
  );

  return popup;
};
