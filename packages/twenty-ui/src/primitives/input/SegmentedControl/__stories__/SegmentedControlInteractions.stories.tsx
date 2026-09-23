import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { TextDirectionProvider } from '@ui/primitives/layout/TextDirectionProvider/TextDirectionProvider';
import { ComponentDecorator } from '@ui/testing';

import { SegmentedControl } from '../SegmentedControl';
import { IconOnlyTabList } from './SegmentedControl.stories';

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
