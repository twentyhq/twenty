import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '@ui/primitives/input/Button/Button';
import { TextDirectionProvider } from '@ui/primitives/layout/TextDirectionProvider/TextDirectionProvider';
import { ComponentDecorator } from '@ui/testing';

import { SegmentedControl } from '../SegmentedControl';
import { type SegmentedControlProps } from '../types/SegmentedControlProps';
import { IconOnlyTabList } from './SegmentedControl.stories';

const ControlledExample = (props: SegmentedControlProps<string>) => {
  const [value, setValue] = useState('system');

  return (
    <>
      <SegmentedControl {...props} value={value} />
      <Button onClick={() => setValue('dark')}>Confirm appearance</Button>
    </>
  );
};

const PendingExample = (props: SegmentedControlProps<string>) => {
  const [isPending, setIsPending] = useState(true);

  return (
    <>
      <SegmentedControl {...props} disabled={isPending} />
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
  title: 'UI/Input/SegmentedControl/Interactions',
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

export const Controlled: Story = {
  render: (args) => <ControlledExample {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const dark = canvas.getByRole('radio', { name: 'Dark' });

    await userEvent.click(dark);
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);
    await expect(args.onValueChange).toHaveBeenCalledWith(
      'dark',
      expect.anything(),
    );
    await expect(canvas.getByRole('radio', { name: 'System' })).toBeChecked();
    await expect(dark).not.toBeChecked();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Confirm appearance' }),
    );
    await expect(dark).toBeChecked();
    await expect(
      canvas.getByRole('radio', { name: 'System' }),
    ).not.toBeChecked();
  },
};

export const DisabledOption: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const light = canvas.getByRole('radio', { name: 'Light' });

    await expect(light).toBeDisabled();
    await userEvent.click(light);
    await expect(canvas.getByRole('radio', { name: 'System' })).toBeChecked();
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

export const Pending: Story = {
  render: (args) => <PendingExample {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const dark = canvas.getByRole('radio', { name: 'Dark' });

    for (const choice of canvas.getAllByRole('radio')) {
      await expect(choice).toBeDisabled();
    }
    await userEvent.click(dark);
    await expect(canvas.getByRole('radio', { name: 'System' })).toBeChecked();
    await expect(args.onValueChange).not.toHaveBeenCalled();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Finish saving' }),
    );
    await expect(dark).toBeEnabled();
    await userEvent.click(dark);
    await expect(dark).toBeChecked();
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);
    await expect(args.onValueChange).toHaveBeenCalledWith(
      'dark',
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
    await userEvent.tab();
    await expect(system).not.toHaveFocus();
    await expect(contrast).not.toHaveFocus();
  },
};

export const RightToLeft: Story = {
  render: (args) => (
    <TextDirectionProvider direction="rtl">
      <SegmentedControl {...args} dir="rtl" />
    </TextDirectionProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await userEvent.keyboard('{ArrowLeft}');
    await waitFor(() =>
      expect(canvas.getByRole('radio', { name: 'Dark' })).toHaveFocus(),
    );
    await expect(canvas.getByRole('radio', { name: 'Dark' })).toBeChecked();
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() =>
      expect(canvas.getByRole('radio', { name: 'System' })).toBeChecked(),
    );
  },
};

export const TabPanels: Story = {
  render: IconOnlyTabList.render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const home = canvas.getByRole('tab', { name: 'Home' });
    const chat = canvas.getByRole('tab', { name: 'Chat' });
    await expect(canvas.getByRole('tabpanel', { name: 'Home' })).toBeVisible();
    await userEvent.tab();
    await expect(home).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(chat).toHaveFocus());
    await expect(chat).toHaveAttribute('aria-selected', 'true');
    await expect(canvas.getByRole('tabpanel', { name: 'Chat' })).toBeVisible();
    await expect(
      canvas.queryByRole('tabpanel', { name: 'Home' }),
    ).not.toBeInTheDocument();
    await expect(chat).toHaveAttribute(
      'aria-controls',
      canvas.getByRole('tabpanel', { name: 'Chat' }).id,
    );
  },
};
