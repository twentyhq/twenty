import { expect, waitFor, within } from 'storybook/test';

export const findTooltip = async (canvasElement: HTMLElement) => {
  const tooltip = await within(canvasElement.ownerDocument.body).findByRole(
    'tooltip',
  );

  await waitFor(() => expect(tooltip).toBeVisible());

  return tooltip;
};
