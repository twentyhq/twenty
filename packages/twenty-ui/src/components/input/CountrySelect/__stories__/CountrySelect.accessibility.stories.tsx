import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Dropdown } from '@ui/components/navigation/Dropdown/Dropdown';
import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

import { CountrySelect } from '../CountrySelect';
import { COUNTRY_CHOICES } from './COUNTRY_CHOICES';
import { CountrySelectExample } from './CountrySelectExample';
import { waitForCountryPopup } from './waitForCountryPopup';

const LONG_COUNTRY_LABEL =
  'A country with a long localized name that exceeds the trigger width';

const meta: Meta<typeof CountrySelectExample> = {
  id: 'ui-input-countryselect-accessibility',
  title: 'UI/Components/Input/CountrySelect/Accessibility',
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

export const VisibleLabelNamesListbox: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Country' }),
    );
    const popup = await waitForCountryPopup({ canvasElement });

    expect(
      within(popup).getByRole('listbox', { name: 'Country' }),
    ).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(popup).not.toBeInTheDocument());
  },
};

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
    expect(
      within(popup).getByRole('listbox', { name: 'Shipping country' }),
    ).toBeVisible();
    const noCountry = within(popup).getByRole('option', { name: 'No country' });

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

    expect(trigger).not.toHaveAttribute('aria-describedby');
    expect(trigger).toHaveAccessibleDescription('');
    await userEvent.click(trigger);
    const popup = await waitForCountryPopup({ canvasElement, name: 'France' });

    expect(
      within(popup).getByRole('listbox', { name: 'France' }),
    ).toBeVisible();

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(popup).not.toBeInTheDocument());
  },
};

export const ExternalLabelledBy: Story = {
  args: { label: '' },
  render: (args) => (
    <>
      <span id="country-name">Destination country</span>
      <CountrySelectExample {...args} aria-labelledby="country-name" />
    </>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Destination country',
    });

    expect(trigger).toHaveAccessibleDescription('France');
    await userEvent.click(trigger);
    const popup = await waitForCountryPopup({
      canvasElement,
      name: 'Destination country',
    });

    expect(
      within(popup).getByRole('listbox', { name: 'Destination country' }),
    ).toBeVisible();
    expect(popup).toHaveAttribute('aria-labelledby', 'country-name');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(popup).not.toBeInTheDocument());
  },
};

export const PopupAriaLabelOverridesTriggerName: Story = {
  args: {
    label: '',
    popupProps: { 'aria-label': 'Country choices' },
    optionsProps: { 'aria-label': 'Supported countries' },
  },
  render: (args) => (
    <>
      <span id="country-name">Destination country</span>
      <CountrySelectExample
        // oxlint-disable-next-line react/jsx-props-no-spreading
        {...args}
        aria-labelledby="country-name"
      />
    </>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Destination country',
    });

    await userEvent.click(trigger);
    const popup = await waitForCountryPopup({
      canvasElement,
      name: 'Country choices',
    });

    const listbox = within(popup).getByRole('listbox', {
      name: 'Supported countries',
    });

    expect(listbox).not.toHaveAttribute('aria-labelledby');
    expect(popup).toHaveAttribute('aria-label', 'Country choices');
    expect(popup).not.toHaveAttribute('aria-labelledby');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(popup).not.toBeInTheDocument());
  },
};

export const PopupLabelledByOverridesTriggerName: Story = {
  args: {
    label: '',
    'aria-label': 'Destination country',
    popupProps: { 'aria-labelledby': 'country-popup-name' },
    optionsProps: { 'aria-labelledby': 'country-popup-name' },
  },
  render: (args) => (
    <>
      <span id="country-popup-name">Country choices</span>
      <CountrySelectExample
        // oxlint-disable-next-line react/jsx-props-no-spreading
        {...args}
      />
    </>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Destination country',
    });

    await userEvent.click(trigger);
    const popup = await waitForCountryPopup({
      canvasElement,
      name: 'Country choices',
    });

    const listbox = within(popup).getByRole('listbox', {
      name: 'Country choices',
    });

    expect(listbox).not.toHaveAttribute('aria-label');
    expect(listbox).toHaveAttribute('aria-labelledby', 'country-popup-name');
    expect(popup).toHaveAttribute('aria-labelledby', 'country-popup-name');
    expect(popup).not.toHaveAttribute('aria-label');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(popup).not.toBeInTheDocument());
  },
};

export const AriaLabelOverVisibleLabel: Story = {
  args: { label: 'Country', 'aria-label': 'Shipping country' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Shipping country' });

    expect(canvas.getByText('Country')).toBeVisible();
    expect(trigger).toHaveAccessibleDescription('France');
    await userEvent.click(trigger);
    const popup = await waitForCountryPopup({
      canvasElement,
      name: 'Shipping country',
    });

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(popup).not.toBeInTheDocument());
  },
};

export const NonButtonTriggerLabel: Story = {
  render: (args) => (
    <CountrySelectExample {...args} render={<div />} nativeButton={false} />
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Country',
    });

    expect(trigger.tagName).toBe('DIV');
    expect(trigger).toHaveAccessibleDescription('France');
    await userEvent.click(trigger);
    const popup = await waitForCountryPopup({ canvasElement });

    expect(
      within(popup).getByRole('listbox', { name: 'Country' }),
    ).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const TruncatedCountryDisclosure: Story = {
  args: {
    countries: [{ value: 'FR', label: LONG_COUNTRY_LABEL, flag: '🇫🇷' }],
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

export const CompoundTitleNamesListbox: Story = {
  render: () => (
    <CountrySelect.Root countries={COUNTRY_CHOICES} defaultValue="FR">
      <Dropdown.Root type="picker">
        <CountrySelect.Trigger label="Country" />
        <Dropdown.Content>
          <Dropdown.Title>Destination countries</Dropdown.Title>
          <CountrySelect.Options />
        </Dropdown.Content>
      </Dropdown.Root>
    </CountrySelect.Root>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Country' }),
    );
    const popup = await waitForCountryPopup({
      canvasElement,
      name: 'Destination countries',
    });
    const title = within(popup).getByText('Destination countries');
    const listbox = within(popup).getByRole('listbox', {
      name: 'Destination countries',
    });

    expect(listbox).toHaveAttribute('aria-labelledby', title.id);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(popup).not.toBeInTheDocument());
  },
};
