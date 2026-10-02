import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

import { CountrySelectExample } from './CountrySelectExample';
import { waitForCountryPopup } from './waitForCountryPopup';

const LONG_COUNTRY_LABEL =
  'A country with a long localized name that exceeds the trigger width';

const meta: Meta<typeof CountrySelectExample> = {
  title: 'UI/Input/CountrySelect/Accessibility',
  component: CountrySelectExample,
  tags: ['!autodocs'],
  decorators: [ComponentDecorator],
  parameters: {
    container: { width: 240, height: 320 },
    a11y: A11Y_DEFER_COLOR_CONTRAST,
  },
  args: { onValueChange: fn(), onOpenChange: fn() },
};

export default meta;
type Story = StoryObj<typeof CountrySelectExample>;

export const SelectedValueDescription: Story = {
  args: { label: '', 'aria-label': 'Shipping country' },
  render: (args) => (
    <>
      <span id="country-help">Delivery destination</span>
      <CountrySelectExample {...args} aria-describedby="country-help" />
    </>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Shipping country',
    });

    expect(trigger).toHaveAccessibleDescription('Delivery destination France');
    await userEvent.click(trigger);
    const popup = await waitForCountryPopup({
      canvasElement,
      name: 'Shipping country',
    });
    const noCountry = within(popup).getByRole('button', { name: 'No country' });

    expect(noCountry.querySelector('svg')?.parentElement).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    await userEvent.click(noCountry);
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    expect(trigger).toHaveAccessibleName('Shipping country');
    expect(trigger).toHaveAccessibleDescription(
      'Delivery destination No country',
    );
  },
};

export const TriggerNameFallback: Story = {
  args: { label: '', 'aria-label': '' },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'France',
    });

    await userEvent.click(trigger);
    const popup = await waitForCountryPopup({ canvasElement, name: 'France' });

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(popup).not.toBeInTheDocument());
  },
};

export const TruncatedCountryDisclosure: Story = {
  args: {
    countries: [{ value: 'France', label: LONG_COUNTRY_LABEL, flag: '🇫🇷' }],
  },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Country',
    });
    const selectedText = within(trigger).getByText(LONG_COUNTRY_LABEL);

    expect(trigger).toHaveAccessibleDescription(LONG_COUNTRY_LABEL);
    expect(selectedText.scrollWidth).toBeGreaterThan(selectedText.clientWidth);
    await userEvent.hover(selectedText);
    const tooltip = await within(canvasElement.ownerDocument.body).findByRole(
      'tooltip',
      { name: LONG_COUNTRY_LABEL },
    );

    await waitFor(() => expect(tooltip).toBeVisible());
    expect(tooltip).toHaveTextContent(LONG_COUNTRY_LABEL);
    await userEvent.unhover(selectedText);
    await waitFor(() => expect(tooltip).not.toBeInTheDocument());
  },
};
