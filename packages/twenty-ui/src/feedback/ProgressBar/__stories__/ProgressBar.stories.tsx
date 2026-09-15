import { type Meta, type StoryObj } from '@storybook/react-vite';
import { ComponentDecorator } from '@ui/testing/decorators/ComponentDecorator';
import { ProgressBar } from '@ui/feedback/ProgressBar/ProgressBar';

const meta: Meta<typeof ProgressBar> = {
  title: 'UI/Feedback/ProgressBar/ProgressBar',
  component: ProgressBar,
  decorators: [ComponentDecorator],
  argTypes: {
    className: { control: false },
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
  },
};

export default meta;

type Story = StoryObj<typeof ProgressBar>;

export const Default: Story = {
  args: {
    value: 75,
    ariaLabel: 'Progress',
  },
};

export const Countdown: Story = {
  tags: ['!test'],
  argTypes: {
    value: { control: false },
  },
  args: {
    value: 100,
    ariaLabel: 'Progress',
    countdownDurationInMs: 10000,
  },
  parameters: {
    chromatic: { disableSnapshot: true },
  },
};
