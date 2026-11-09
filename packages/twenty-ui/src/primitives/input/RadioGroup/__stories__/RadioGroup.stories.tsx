import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Radio } from '@ui/primitives/input/Radio/Radio';
import { Text } from '@ui/primitives/typography/Text/Text';
import { ComponentDecorator } from '@ui/testing';

import { RadioGroup } from '../RadioGroup';

const meta: Meta<typeof RadioGroup> = {
  title: 'UI/Input/RadioGroup',
  component: RadioGroup,
  args: {
    'aria-label': 'Billing frequency',
    name: 'billingFrequency',
    defaultValue: 'monthly',
    children: (
      <>
        <Radio value="monthly">Monthly</Radio>
        <Radio value="yearly">Yearly</Radio>
      </>
    ),
  },
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

export const Display: Story = {
  decorators: [ComponentDecorator],
};

export const Horizontal: Story = {
  ...Display,
  args: { orientation: 'horizontal' },
};

export const GridCards: Story = {
  ...Display,
  parameters: { container: { width: 320 } },
  args: {
    'aria-label': 'Plan',
    name: 'plan',
    defaultValue: 'Starter',
    layout: 'grid',
    minColumnWidth: 120,
    children: ['Starter', 'Team', 'Enterprise', 'Custom'].map((plan) => (
      <Radio key={plan} value={plan} variant="card">
        <Text render={<span />}>{plan}</Text>
      </Radio>
    )),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const starter = canvas.getByRole('radio', { name: 'Starter' });
    const team = canvas.getByRole('radio', { name: 'Team' });
    const enterprise = canvas.getByRole('radio', { name: 'Enterprise' });

    await expect(team.getBoundingClientRect().top).toBe(
      starter.getBoundingClientRect().top,
    );
    await expect(enterprise.getBoundingClientRect().top).toBeGreaterThan(
      starter.getBoundingClientRect().bottom,
    );
    await userEvent.click(starter);
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => {
      expect(team).toHaveFocus();
      expect(team).toBeChecked();
    });
  },
};
