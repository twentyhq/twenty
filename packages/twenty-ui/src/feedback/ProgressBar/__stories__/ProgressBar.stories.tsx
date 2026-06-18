import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useProgressAnimation } from '@ui/feedback/ProgressBar/hooks/useProgressAnimation';
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
  // TODO(a11y): violations inherited from deprecated story; fix during a11y pass
  parameters: { a11y: { test: 'todo' } },
  args: {
    value: 75,
  },
};

export const Animated: Story = {
  tags: ['!test'],
  argTypes: {
    value: { control: false },
  },
  decorators: [
    (Story) => {
      const { value } = useProgressAnimation({
        autoPlay: true,
        initialValue: 0,
        finalValue: 100,
        options: {
          duration: 10000,
        },
      });

      return <Story args={{ value }} />;
    },
  ],
  parameters: {
    chromatic: { disableSnapshot: true },
  },
};
