import { type Meta, type StoryObj } from '@storybook/react-vite';
import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';
import { SidePanelInformationBanner } from '@ui/feedback/SidePanelInformationBanner/SidePanelInformationBanner';

const meta: Meta<typeof SidePanelInformationBanner> = {
  title: 'UI/Feedback/SidePanelInformationBanner',
  component: SidePanelInformationBanner,
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof SidePanelInformationBanner>;

export const Default: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: {
    message: 'Max 200 bars per chart. Consider adding a filter',
  },
};

export const ShortMessage: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: {
    message: 'Too many groups',
  },
};

export const LongMessage: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: {
    message:
      'The chart has exceeded the maximum number of 200 bars. Please consider adding filters to reduce the number of data points displayed.',
  },
};
