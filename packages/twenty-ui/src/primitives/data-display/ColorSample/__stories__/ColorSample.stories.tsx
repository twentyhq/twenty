import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { ColorSample } from '@ui/primitives/data-display/ColorSample/ColorSample';
import { Text } from '@ui/primitives/typography';
import { ComponentDecorator } from '@ui/testing';

const meta: Meta<typeof ColorSample> = {
  title: 'UI/Data Display/ColorSample',
  component: ColorSample,
  decorators: [ComponentDecorator],
  args: { colorName: 'green' },
};

export default meta;
type Story = StoryObj<typeof ColorSample>;

export const Default: Story = {
  args: { 'aria-hidden': true },
};

export const Circle: Story = {
  args: { variant: 'circle', role: 'img', 'aria-label': 'Green' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('img', { name: 'Green' })).toHaveStyle({
      width: '16px',
      height: '16px',
      borderRadius: '50%',
    });
  },
};

export const WithLabel: Story = {
  render: (args) => (
    <Text style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <ColorSample {...args} render={<span />} aria-hidden="true" />
      High priority
    </Text>
  ),
};

export const CustomColor: Story = {
  args: {
    colorName: 'blue',
    color: '#123456',
    role: 'img',
    'aria-label': 'Brand blue',
    style: { width: 24 },
    render: <span />,
  },
  play: async ({ canvas }) => {
    const swatch = canvas.getByRole('img', { name: 'Brand blue' });

    await expect(swatch.tagName).toBe('SPAN');
    await expect(swatch).toHaveStyle({
      backgroundColor: 'rgb(18, 52, 86)',
      width: '24px',
      height: '16px',
      borderWidth: '1px',
    });
  },
};
