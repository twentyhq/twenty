import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

import { assertCountryAvailabilityReset } from './assertCountryAvailabilityReset';
import { CountrySelectAvailabilityExample } from './CountrySelectAvailabilityExample';
import { waitForCountryPopup } from './waitForCountryPopup';

const meta: Meta<typeof CountrySelectAvailabilityExample> = {
  title: 'UI/Input/CountrySelect/Availability',
  component: CountrySelectAvailabilityExample,
  tags: ['!autodocs'],
  decorators: [ComponentDecorator],
  parameters: {
    container: { width: 320, height: 320 },
    a11y: A11Y_DEFER_COLOR_CONTRAST,
  },
  args: { onOpenChange: fn(), availability: 'disabled' },
};

export default meta;
type Story = StoryObj<typeof CountrySelectAvailabilityExample>;

export const DisableAndEnable: Story = {
  play: assertCountryAvailabilityReset,
};

export const ControlledDisableAndEnable: Story = {
  args: { controlled: true },
  play: assertCountryAvailabilityReset,
};

export const RemoveAndRestoreCountries: Story = {
  args: { availability: 'countries' },
  play: assertCountryAvailabilityReset,
};

export const ControlledRemoveAndRestoreCountries: Story = {
  args: { controlled: true, availability: 'countries' },
  play: assertCountryAvailabilityReset,
};

export const NotifyControlledHostOnce: Story = {
  args: { controlled: true, ignoreCloseRequests: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Country' });

    await userEvent.click(trigger);
    const popup = await waitForCountryPopup({ canvasElement });

    await userEvent.click(
      within(popup).getByRole('button', { name: 'Make countries unavailable' }),
    );
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    expect(trigger).toBeDisabled();
    expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Refresh host 0' }),
    );
    expect(args.onOpenChange).toHaveBeenCalledTimes(2);
  },
};
