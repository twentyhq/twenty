import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type CSSProperties, useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '@ui/primitives/input/Button/Button';
import { TextDirectionProvider } from '@ui/primitives/layout/TextDirectionProvider/TextDirectionProvider';
import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';
import { ThemeProvider } from '@ui/theme/ThemeProvider';

import { CountrySelect } from '../CountrySelect';
import { type CountrySelectProps } from '../types/CountrySelectProps';
import { COUNTRY_CHOICES } from './COUNTRY_CHOICES';
import { CountrySelectExample } from './CountrySelectExample';
import { waitForCountryPopup } from './waitForCountryPopup';

const meta: Meta<typeof CountrySelectExample> = {
  title: 'UI/Input/CountrySelect/Interactions',
  component: CountrySelectExample,
  tags: ['!autodocs'],
  decorators: [ComponentDecorator],
  parameters: {
    container: { width: 320, height: 320 },
    a11y: {
      config: {
        rules: [
          ...A11Y_DEFER_COLOR_CONTRAST.config.rules,
          {
            id: 'aria-hidden-focus',
            selector: '[aria-hidden="true"]:not([data-base-ui-focus-guard])',
          },
        ],
      },
    },
  },
  args: { onValueChange: fn(), onOpenChange: fn() },
};

export default meta;
type Story = StoryObj<typeof CountrySelectExample>;

export const PointerSelection: Story = {
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Country',
    });

    expect(trigger).toHaveTextContent('France');
    expect(within(trigger).getByText('🇫🇷')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    await userEvent.click(trigger);
    const popup = await waitForCountryPopup({ canvasElement });
    const choices = within(popup);

    expect(choices.getByRole('button', { name: 'France' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(choices.getByText('🇧🇷')).toHaveAttribute('aria-hidden', 'true');
    await userEvent.click(choices.getByRole('button', { name: 'Brésil' }));
    expect(args.onValueChange).toHaveBeenCalledWith('Brazil');
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    expect(trigger).toHaveTextContent('Brésil');
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
  },
};

export const SearchAndKeyboard: Story = {
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Country',
    });

    await userEvent.tab();
    expect(trigger).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    const popup = await waitForCountryPopup({ canvasElement });
    const choices = within(popup);
    const search = choices.getByRole('searchbox', {
      name: 'Search countries',
    });

    await userEvent.keyboard('{Enter}');
    expect(args.onValueChange).not.toHaveBeenCalled();
    await userEvent.type(search, 'BRESIL');
    expect(choices.queryByRole('button', { name: 'France' })).toBeNull();
    expect(choices.queryByRole('button', { name: 'No country' })).toBeNull();
    expect(choices.getByRole('button', { name: 'Brésil' })).toBeVisible();
    await userEvent.keyboard('{Enter}');
    expect(args.onValueChange).toHaveBeenCalledWith('Brazil');
    expect(choices.getByRole('searchbox')).toHaveValue('BRESIL');
    expect(choices.queryByRole('button', { name: 'France' })).toBeNull();
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.keyboard('{Enter}');
    const reopenedPopup = await waitForCountryPopup({ canvasElement });
    const reopenedChoices = within(reopenedPopup);

    expect(reopenedChoices.getByRole('searchbox')).toHaveValue('');
    await userEvent.keyboard('{ArrowDown}');
    expect(
      reopenedChoices.getByRole('button', { name: 'No country' }),
    ).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(
      reopenedChoices.getByRole('button', { name: 'France' }),
    ).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(args.onValueChange).toHaveBeenLastCalledWith('France');
    await waitFor(() => expect(reopenedPopup).not.toBeInTheDocument());
    expect(trigger).toHaveTextContent('France');
  },
};

export const SearchListsCountriesBeforeNoCountry: Story = {
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Country',
    });

    await userEvent.click(trigger);
    const popup = await waitForCountryPopup({ canvasElement });
    const choices = within(popup);
    const search = choices.getByRole('searchbox');

    expect(choices.getAllByRole('button')[0]).toHaveAccessibleName(
      'No country',
    );
    await userEvent.type(search, ' ');
    const unfilteredChoices = choices.getAllByRole('button');

    expect(unfilteredChoices).toHaveLength(4);
    expect(unfilteredChoices[0]).toHaveAccessibleName('No country');
    await userEvent.type(search, 'o');
    const matchingChoices = choices.getAllByRole('button');

    expect(matchingChoices).toHaveLength(2);
    expect(matchingChoices[0]).toHaveAccessibleName('Japon');
    expect(matchingChoices[1]).toHaveAccessibleName('No country');
    await userEvent.keyboard('{Enter}');
    expect(args.onValueChange).toHaveBeenCalledTimes(1);
    expect(args.onValueChange).toHaveBeenCalledWith('Japan');
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    expect(trigger).toHaveTextContent('Japon');
  },
};

export const ClearCountry: Story = {
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Country',
    });

    await userEvent.click(trigger);
    const popup = await waitForCountryPopup({ canvasElement });
    const choices = within(popup);

    await userEvent.type(choices.getByRole('searchbox'), 'NO COUNTRY');
    expect(choices.getAllByRole('button')).toHaveLength(1);
    await userEvent.click(choices.getByRole('button', { name: 'No country' }));
    expect(args.onValueChange).toHaveBeenCalledWith('');
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    expect(trigger).toHaveTextContent('No country');
    await userEvent.click(trigger);
    const reopenedPopup = await waitForCountryPopup({ canvasElement });

    expect(
      within(reopenedPopup).getByRole('button', { name: 'No country' }),
    ).toHaveAttribute('aria-pressed', 'true');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(reopenedPopup).not.toBeInTheDocument());
  },
};

export const EmptySearchAndEscape: Story = {
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Country',
    });

    await userEvent.click(trigger);
    const popup = await waitForCountryPopup({ canvasElement });
    const choices = within(popup);
    const search = choices.getByRole('searchbox');

    await userEvent.type(search, 'Atlantis');
    expect(choices.getByRole('status')).toHaveTextContent('No countries found');
    expect(choices.queryAllByRole('button')).toHaveLength(0);
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(args.onValueChange).not.toHaveBeenCalled();
    expect(popup).toBeVisible();
    expect(search).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(trigger).toHaveTextContent('France');
    expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
  },
};

export const ReopenDuringExitFade: Story = {
  args: {
    popupProps: {
      style: { '--t-animation-duration-fast': '1' } as CSSProperties,
    },
  },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Country',
    });

    await userEvent.click(trigger);
    const popup = await waitForCountryPopup({ canvasElement });

    await userEvent.type(within(popup).getByRole('searchbox'), 'bresil');
    await waitFor(() => expect(getComputedStyle(popup).opacity).toBe('1'), {
      timeout: 2000,
    });
    await userEvent.keyboard('{Escape}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(popup).toBeInTheDocument();
    await userEvent.click(trigger);
    const reopenedPopup = await waitForCountryPopup({ canvasElement });
    const reopenedChoices = within(reopenedPopup);

    expect(reopenedPopup).toBe(popup);
    expect(reopenedChoices.getByRole('searchbox')).toHaveValue('');
    expect(reopenedChoices.getAllByRole('button')).toHaveLength(4);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(reopenedPopup).not.toBeInTheDocument(), {
      timeout: 2000,
    });
  },
};

export const UnknownStoredValue: Story = {
  args: { value: 'Previously stored country' },
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Country',
    });

    expect(trigger).toHaveTextContent('No country');
    await userEvent.click(trigger);
    const popup = await waitForCountryPopup({ canvasElement });

    for (const choice of within(popup).getAllByRole('button')) {
      expect(choice).toHaveAttribute('aria-pressed', 'false');
    }

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    expect(args.onValueChange).not.toHaveBeenCalled();
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const DisabledAndUnavailable: Story = {
  render: (args) => (
    <>
      <CountrySelectExample {...args} label="Disabled country" disabled />
      <CountrySelectExample
        {...args}
        label="Unavailable countries"
        countries={[]}
        value=""
      />
    </>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    for (const name of ['Disabled country', 'Unavailable countries']) {
      const trigger = canvas.getByRole('button', { name });

      expect(trigger).toHaveAttribute('aria-disabled', 'true');
      expect(trigger).toHaveAttribute('data-disabled');
      await userEvent.tab();
      expect(trigger).toHaveFocus();
      await userEvent.keyboard('{ArrowDown}');
      await userEvent.keyboard('{Enter}');
      await userEvent.keyboard(' ');
      await userEvent.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(body.queryByRole('dialog')).toBeNull();
      await userEvent.click(canvas.getByText(name, { selector: 'label' }));
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(body.queryByRole('dialog')).toBeNull();
    }

    expect(args.onOpenChange).not.toHaveBeenCalled();
    expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

export const DisabledSkipsTriggerHandlers: Story = {
  args: {
    disabled: true,
    onClick: fn(),
    onPointerDown: fn(),
    onKeyDown: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Country',
    });

    const defaultPreventedKeys: string[] = [];
    const recordDefaultPreventedKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented) {
        defaultPreventedKeys.push(event.key);
      }
    };

    canvasElement.ownerDocument.addEventListener(
      'keydown',
      recordDefaultPreventedKey,
    );
    await userEvent.tab();
    expect(trigger).toHaveFocus();
    await userEvent.keyboard('{Shift}{ArrowDown}{ArrowUp}');
    await userEvent.click(trigger);
    canvasElement.ownerDocument.removeEventListener(
      'keydown',
      recordDefaultPreventedKey,
    );

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(defaultPreventedKeys).toEqual([]);
    expect(args.onKeyDown).not.toHaveBeenCalled();
    expect(args.onPointerDown).not.toHaveBeenCalled();
    expect(args.onClick).not.toHaveBeenCalled();
    expect(args.onOpenChange).not.toHaveBeenCalled();
  },
};

export const EnabledRunsTriggerHandlers: Story = {
  args: {
    onClick: fn(),
    onPointerDown: fn(),
    onKeyDown: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Country',
    });

    await userEvent.tab();
    expect(trigger).toHaveFocus();
    await userEvent.keyboard('{Shift}');
    await userEvent.click(trigger);
    const popup = await waitForCountryPopup({ canvasElement });

    expect(args.onKeyDown).toHaveBeenCalledTimes(1);
    expect(args.onPointerDown).toHaveBeenCalledTimes(1);
    expect(args.onClick).toHaveBeenCalledTimes(1);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(popup).not.toBeInTheDocument());
  },
};

export const IndependentInstances: Story = {
  render: () => (
    <>
      <CountrySelectExample label="Billing country" />
      <CountrySelectExample label="Shipping country" value="Japan" />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const billing = canvas.getByRole('button', { name: 'Billing country' });
    const shipping = canvas.getByRole('button', { name: 'Shipping country' });

    expect(billing.id).not.toBe(shipping.id);
    await userEvent.click(billing);
    const popup = await waitForCountryPopup({
      canvasElement,
      name: 'Billing country',
    });

    await userEvent.type(within(popup).getByRole('searchbox'), 'bresil');
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    expect(billing).toHaveTextContent('Brésil');
    expect(shipping).toHaveTextContent('Japon');
    await userEvent.click(shipping);
    const shippingPopup = await waitForCountryPopup({
      canvasElement,
      name: 'Shipping country',
    });

    expect(shippingPopup).toHaveAccessibleName('Shipping country');
    expect(within(shippingPopup).getByRole('searchbox')).toHaveValue('');
    await userEvent.click(
      within(shippingPopup).getByRole('button', { name: 'No country' }),
    );
    await waitFor(() => expect(shippingPopup).not.toBeInTheDocument());
    expect(shipping).toHaveTextContent('No country');
    expect(billing).toHaveTextContent('Brésil');
  },
};

const ControlledCountryExample = ({
  onValueChange,
  onOpenChange,
}: Partial<CountrySelectProps>) => {
  const [value, setValue] = useState('France');
  const [open, setOpen] = useState(false);

  return (
    <>
      <CountrySelect
        countries={COUNTRY_CHOICES}
        label="Country"
        searchLabel="Search countries"
        noCountryLabel="No country"
        noResultsLabel="No countries found"
        value={value}
        onValueChange={onValueChange ?? (() => undefined)}
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          onOpenChange?.(nextOpen);
        }}
      />
      <Button onClick={() => setValue('Japan')}>Apply Japan</Button>
      <Button onClick={() => setOpen(true)}>Open countries</Button>
    </>
  );
};

export const ControlledUpdates: Story = {
  render: (args) => <ControlledCountryExample {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Country' });

    await userEvent.click(
      canvas.getByRole('button', { name: 'Open countries' }),
    );
    const popup = await waitForCountryPopup({ canvasElement });

    await userEvent.click(
      within(popup).getByRole('button', { name: 'Brésil' }),
    );
    expect(args.onValueChange).toHaveBeenCalledWith('Brazil');
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    expect(args.onOpenChange).toHaveBeenCalledWith(false);
    expect(trigger).toHaveTextContent('France');
    await userEvent.click(canvas.getByRole('button', { name: 'Apply Japan' }));
    expect(trigger).toHaveTextContent('Japon');
  },
};

const ArgumentUpdatesExample = (props: Partial<CountrySelectProps>) => {
  const [value, setValue] = useState('France');

  return (
    <>
      <CountrySelectExample {...props} value={value} />
      <Button onClick={() => setValue('Japan')}>Apply Japan</Button>
    </>
  );
};

export const ArgumentUpdates: Story = {
  render: (args) => <ArgumentUpdatesExample {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Country' }));
    const popup = await waitForCountryPopup({ canvasElement });

    await userEvent.click(
      within(popup).getByRole('button', { name: 'Brésil' }),
    );
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    expect(canvas.getByRole('button', { name: 'Country' })).toHaveTextContent(
      'Brésil',
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Apply Japan' }));
    expect(canvas.getByRole('button', { name: 'Country' })).toHaveTextContent(
      'Japon',
    );
    expect(args.onValueChange).toHaveBeenCalledTimes(1);
    expect(args.onValueChange).toHaveBeenCalledWith('Brazil');
  },
};

const ScopedCountryExample = (props: Partial<CountrySelectProps>) => {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  return (
    <ThemeProvider colorScheme="dark" applyToRoot={false}>
      <TextDirectionProvider direction="rtl">
        <div dir="rtl">
          <CountrySelectExample
            {...props}
            popupProps={{ ...props.popupProps, container, align: 'start' }}
          />
          <div ref={setContainer} role="region" aria-label="Country portal" />
        </div>
      </TextDirectionProvider>
    </ThemeProvider>
  );
};

export const ScopedThemeAndContainer: Story = {
  render: (args) => <ScopedCountryExample {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Country' });

    await userEvent.click(trigger);
    const popup = await waitForCountryPopup({ canvasElement });

    expect(
      canvas.getByRole('region', { name: 'Country portal' }),
    ).toContainElement(popup);
    expect(popup.closest('.dark')).not.toBeNull();
    expect(getComputedStyle(popup).direction).toBe('rtl');
    await userEvent.type(within(popup).getByRole('searchbox'), 'japon');
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    expect(trigger).toHaveTextContent('Japon');
  },
};
