import { type Meta, type StoryObj } from '@storybook/react-vite';
import { ComponentDecorator } from '@ui/testing';
import { SidePanelInformationBanner } from '../SidePanelInformationBanner';

const meta: Meta<typeof SidePanelInformationBanner> = {
  title: 'UI/Display/Banner/SidePanelInformationBanner',
  component: SidePanelInformationBanner,
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof SidePanelInformationBanner>;

export const Default: Story = {
  // TODO(a11y): violations inherited from deprecated story; fix during a11y pass
  parameters: { a11y: { test: 'todo' } },
  args: {
    message: 'Max 200 bars per chart. Consider adding a filter',
  },
};

export const ShortMessage: Story = {
  // TODO(a11y): violations inherited from deprecated story; fix during a11y pass
  parameters: { a11y: { test: 'todo' } },
  args: {
    message: 'Too many groups',
  },
};

export const LongMessage: Story = {
  // TODO(a11y): violations inherited from deprecated story; fix during a11y pass
  parameters: { a11y: { test: 'todo' } },
  args: {
    message:
      'The chart has exceeded the maximum number of 200 bars. Please consider adding filters to reduce the number of data points displayed.',
  },
};
