import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { IconComment, IconHome } from '@ui/icon';
import { DirectionProvider } from '@ui/primitives/layout/DirectionProvider/DirectionProvider';
import { Button } from '@ui/primitives/input/Button/Button';
import { ComponentDecorator } from '@ui/testing';

import { SegmentedControl } from '../SegmentedControl';
import { type SegmentedControlProps } from '../types/SegmentedControlProps';

const ControlledExample = (props: SegmentedControlProps<string>) => {
  const [appearance, setAppearance] = useState('system');

  return (
    <>
      <SegmentedControl
        {...props}
        defaultValue={undefined}
        value={appearance}
        onValueChange={(value, eventDetails) => {
          props.onValueChange?.(value, eventDetails);
          setAppearance(value);
        }}
      />
      <output aria-label="Selected appearance">{appearance}</output>
    </>
  );
};

const PendingExample = (props: SegmentedControlProps<string>) => {
  const [isPending, setIsPending] = useState(false);

  return (
    <>
      <SegmentedControl
        {...props}
        disabled={isPending}
        onValueChange={(value, eventDetails) => {
          props.onValueChange?.(value, eventDetails);
          setIsPending(true);
        }}
      />
      <Button onClick={() => setIsPending(false)}>Finish saving</Button>
    </>
  );
};

const FormExample = (props: SegmentedControlProps<string>) => {
  const [savedAppearance, setSavedAppearance] = useState('Not saved');

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSavedAppearance(
          String(new FormData(event.currentTarget).get('appearance')),
        );
      }}
    >
      <SegmentedControl {...props} name="appearance" />
      <Button type="submit">Save appearance</Button>
      <output aria-label="Saved appearance">{savedAppearance}</output>
    </form>
  );
};

const meta: Meta<typeof SegmentedControl> = {
  title: 'Components/Input/SegmentedControl/Interactions',
  component: SegmentedControl,
  decorators: [ComponentDecorator],
  args: {
    'aria-label': 'Appearance',
    defaultValue: 'system',
    onValueChange: fn(),
    options: [
      { value: 'system', label: 'System' },
      { value: 'light', label: 'Light', disabled: true },
      { value: 'dark', label: 'Dark' },
      { value: 'contrast', label: 'High contrast' },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof SegmentedControl>;

export const Uncontrolled: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const dark = canvas.getByRole('radio', { name: 'Dark' });

    await expect(
      canvas.getByRole('radiogroup', { name: 'Appearance' }),
    ).toBeVisible();
    await expect(canvas.getByRole('radio', { name: 'System' })).toBeChecked();
    await userEvent.click(dark);
    await userEvent.click(dark);

    await expect(dark).toBeChecked();
    await expect(
      canvas.getByRole('radio', { name: 'System' }),
    ).not.toBeChecked();
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);
    await expect(args.onValueChange).toHaveBeenCalledWith(
      'dark',
      expect.anything(),
    );
  },
};

export const DisabledOption: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const light = canvas.getByRole('radio', { name: 'Light' });

    await expect(light).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(light);
    await expect(canvas.getByRole('radio', { name: 'System' })).toBeChecked();
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

export const DisabledCheckedOption: Story = {
  args: { defaultValue: 'light' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dark = canvas.getByRole('radio', { name: 'Dark' });

    await userEvent.tab();
    await expect(canvas.getByRole('radio', { name: 'Light' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(dark).toHaveFocus());
    await expect(dark).toBeChecked();
  },
};

export const Pending: Story = {
  render: (args) => <PendingExample {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const dark = canvas.getByRole('radio', { name: 'Dark' });
    const contrast = canvas.getByRole('radio', { name: 'High contrast' });

    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(dark).toBeChecked());
    for (const choice of canvas.getAllByRole('radio')) {
      await expect(choice).toHaveAttribute('aria-disabled', 'true');
    }
    await expect(dark).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(dark).toHaveFocus();
    await userEvent.click(contrast);
    await expect(contrast).not.toBeChecked();
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Finish saving' }),
    );
    await expect(contrast).not.toHaveAttribute('aria-disabled');
    await userEvent.click(contrast);
    await expect(contrast).toBeChecked();
    await expect(args.onValueChange).toHaveBeenCalledTimes(2);
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      'contrast',
      expect.anything(),
    );
  },
};

export const FormSubmission: Story = {
  render: (args) => <FormExample {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const savedAppearance = canvas.getByLabelText('Saved appearance');

    await userEvent.click(canvas.getByRole('radio', { name: 'Dark' }));
    await expect(savedAppearance).toHaveTextContent('Not saved');

    await userEvent.click(
      canvas.getByRole('button', { name: 'Save appearance' }),
    );
    await expect(savedAppearance).toHaveTextContent('dark');
  },
};

export const Keyboard: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const system = canvas.getByRole('radio', { name: 'System' });
    const dark = canvas.getByRole('radio', { name: 'Dark' });
    const contrast = canvas.getByRole('radio', { name: 'High contrast' });

    await userEvent.tab();
    await expect(system).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(dark).toHaveFocus());
    await expect(dark).toBeChecked();
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      'dark',
      expect.anything(),
    );
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(contrast).toBeChecked());
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(system).toHaveFocus());
    await expect(system).toBeChecked();
    await userEvent.keyboard('{ArrowLeft}');
    await waitFor(() => expect(contrast).toBeChecked());
    await userEvent.tab({ shift: true });
    await expect(contrast).not.toHaveFocus();
    await userEvent.tab();
    await expect(contrast).toHaveFocus();
  },
};

export const Controlled: Story = {
  render: (args) => <ControlledExample {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const dark = canvas.getByRole('radio', { name: 'Dark' });

    await userEvent.click(dark);

    await expect(dark).toBeChecked();
    await expect(
      canvas.getByLabelText('Selected appearance'),
    ).toHaveTextContent('dark');
    await expect(args.onValueChange).toHaveBeenCalledWith(
      'dark',
      expect.objectContaining({ reason: 'none' }),
    );
  },
};

export const EqualWidths: Story = {
  args: {
    'aria-label': 'Billing period',
    defaultValue: 'annual',
    style: { width: 280 },
    options: [
      { label: 'Annual', value: 'annual' },
      { label: 'Monthly', value: 'monthly' },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const monthlyLabel = canvas.getByText('Monthly');

    await expect(
      canvas.getByRole('radio', { name: 'Annual' }).getBoundingClientRect()
        .width,
    ).toBe(
      canvas.getByRole('radio', { name: 'Monthly' }).getBoundingClientRect()
        .width,
    );
    await expect(monthlyLabel.scrollWidth).toBeLessThanOrEqual(
      monthlyLabel.clientWidth,
    );
    await expect(
      canvas.getByRole('radiogroup', { name: 'Billing period' }),
    ).toHaveStyle({ gridAutoFlow: 'column', gap: '2px' });
  },
};

export const IconOnly: Story = {
  args: {
    'aria-label': 'Start page',
    defaultValue: 'home',
    options: [
      {
        startIcon: <IconHome data-testid="direct-icon" />,
        'aria-label': 'Home',
        value: 'home',
      },
      {
        startIcon: (
          <span>
            <IconComment data-testid="wrapped-icon" />
          </span>
        ),
        'aria-label': 'Chat',
        value: 'chat',
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const home = canvas.getByRole('radio', { name: 'Home' });
    const chat = canvas.getByRole('radio', { name: 'Chat' });
    const directIcon = canvas.getByTestId('direct-icon');
    const directIconBounds = directIcon.getBoundingClientRect();
    const wrappedIconBounds = canvas
      .getByTestId('wrapped-icon')
      .getBoundingClientRect();

    await expect(directIcon.parentElement).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    await expect(directIconBounds.width).toBeGreaterThan(0);
    await expect(wrappedIconBounds.width).toBe(directIconBounds.width);
    await expect(wrappedIconBounds.height).toBe(directIconBounds.height);
    await expect(home).toBeChecked();
    await expect(chat).not.toBeChecked();
    await userEvent.click(chat);
    await expect(chat).toBeChecked();
    await expect(home).not.toBeChecked();
  },
};

export const RightToLeft: Story = {
  render: (args) => (
    <DirectionProvider direction="rtl">
      <SegmentedControl {...args} dir="rtl" />
    </DirectionProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const system = canvas.getByRole('radio', { name: 'System' });
    const dark = canvas.getByRole('radio', { name: 'Dark' });

    await userEvent.tab();
    await expect(system).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    await waitFor(() => expect(dark).toHaveFocus());
    await expect(dark).toBeChecked();
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(system).toBeChecked());
  },
};
