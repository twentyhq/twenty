import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { ComponentDecorator } from '@ui/testing/decorators/ComponentDecorator';
import { ProgressBar } from '@ui/primitives/feedback/ProgressBar/ProgressBar';
import { Button } from '@ui/primitives/input/Button/Button';

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

const ControlledProgressBar = () => {
  const [value, setValue] = useState(0);

  return (
    <>
      <ProgressBar value={value} ariaLabel="Import progress" />
      <Button onClick={() => setValue(50)}>Report progress</Button>
      <Button onClick={() => setValue(100)}>Complete import</Button>
    </>
  );
};

export const Controlled: Story = {
  render: () => <ControlledProgressBar />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const progress = canvas.getByRole('progressbar', {
      name: 'Import progress',
    });

    expect(progress).toHaveAttribute('aria-valuenow', '0');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Report progress' }),
    );
    expect(progress).toHaveAttribute('aria-valuenow', '50');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Complete import' }),
    );
    expect(progress).toHaveAttribute('aria-valuenow', '100');
  },
};
