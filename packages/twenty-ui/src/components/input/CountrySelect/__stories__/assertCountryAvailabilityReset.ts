import { expect, userEvent, waitFor, within } from 'storybook/test';

import { type CountrySelectProps } from '../types/CountrySelectProps';
import { waitForCountryPopup } from './waitForCountryPopup';

export const assertCountryAvailabilityReset = async ({
  canvasElement,
  args,
}: {
  canvasElement: HTMLElement;
  args: Partial<CountrySelectProps>;
}) => {
  const canvas = within(canvasElement);
  const trigger = canvas.getByRole('button', { name: 'Country' });

  await userEvent.click(trigger);
  const popup = await waitForCountryPopup({ canvasElement });

  await userEvent.type(within(popup).getByRole('searchbox'), 'bresil');
  await userEvent.click(
    within(popup).getByRole('button', { name: 'Make countries unavailable' }),
  );
  await waitFor(() => expect(popup).not.toBeInTheDocument());
  expect(trigger).toHaveAttribute('aria-disabled', 'true');
  await waitFor(() => expect(trigger).toHaveFocus());
  expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
  expect(args.onOpenChange).toHaveBeenCalledTimes(2);
  await userEvent.keyboard('{Enter}');
  await userEvent.click(trigger);
  expect(
    within(canvasElement.ownerDocument.body).queryByRole('dialog'),
  ).toBeNull();
  expect(args.onOpenChange).toHaveBeenCalledTimes(2);
  await userEvent.click(
    canvas.getByRole('button', { name: 'Restore countries' }),
  );
  expect(trigger).not.toHaveAttribute('aria-disabled');
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  expect(args.onOpenChange).toHaveBeenCalledTimes(2);
  await userEvent.click(trigger);
  const reopenedPopup = await waitForCountryPopup({ canvasElement });

  expect(within(reopenedPopup).getByRole('searchbox')).toHaveValue('');
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(reopenedPopup).not.toBeInTheDocument());
};
