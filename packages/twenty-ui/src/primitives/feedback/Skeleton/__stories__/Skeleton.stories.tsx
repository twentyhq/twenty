import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { Skeleton } from '@ui/primitives/feedback';
import { Text } from '@ui/primitives/typography';
import { ComponentDecorator } from '@ui/testing';
import { ThemeProvider } from '@ui/theme';

const meta: Meta<typeof Skeleton> = {
  title: 'UI/Feedback/Skeleton',
  component: Skeleton,
  decorators: [ComponentDecorator],
  args: { width: 240, height: 16 },
  render: (args) => <Skeleton {...args} data-testid="placeholder" />,
};

export default meta;

type Story = StoryObj<typeof Skeleton>;

const isMotionEnabled = () =>
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const Default: Story = {
  play: async ({ canvas }) => {
    const placeholder = canvas.getByTestId('placeholder');

    await expect(placeholder).toBeVisible();
    await expect(placeholder).toHaveAttribute('aria-hidden', 'true');
    await expect(placeholder).toHaveStyle({ width: '240px', height: '16px' });
    const isAnimating =
      getComputedStyle(placeholder, '::after').animationName !== 'none';

    await expect(isAnimating).toBe(isMotionEnabled());
  },
};

export const Shapes: Story = {
  render: () => (
    <Text
      render={<div />}
      style={{ display: 'flex', gap: 16, alignItems: 'center' }}
    >
      <Skeleton width={40} height={40} borderRadius="50%" />
      <Text
        render={<div />}
        style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
      >
        <Skeleton width={180} height={16} />
        <Skeleton width={120} height={13} />
      </Text>
    </Text>
  ),
};

export const Static: Story = {
  args: { animated: false },
  play: async ({ canvas }) => {
    const placeholder = canvas.getByTestId('placeholder');

    await expect(placeholder).toBeVisible();
    await expect(getComputedStyle(placeholder, '::after').animationName).toBe(
      'none',
    );
  },
};

export const Dark: Story = {
  decorators: [
    (Story) => (
      <ThemeProvider colorScheme="dark">
        <Story />
      </ThemeProvider>
    ),
  ],
};

export const RightToLeft: Story = {
  args: { dir: 'rtl' },
  play: async ({ canvas }) => {
    const highlight = getComputedStyle(
      canvas.getByTestId('placeholder'),
      '::after',
    );

    if (!isMotionEnabled()) {
      await expect(highlight.animationName).toBe('none');
      return;
    }

    await expect(highlight.animationDirection).toBe('reverse');
  },
};

export const Composition: Story = {
  args: {
    render: <div />,
    width: '50%',
    height: 32,
    borderRadius: 8,
    baseColor: '#123456',
    highlightColor: '#abcdef',
    style: { marginTop: 8 },
  },
  play: async ({ canvas }) => {
    const placeholder = canvas.getByTestId('placeholder');

    await expect(placeholder.tagName).toBe('DIV');
    await expect(placeholder.style.width).toBe('50%');
    await expect(placeholder).toHaveStyle({
      height: '32px',
      'border-radius': '8px',
      'background-color': 'rgb(18, 52, 86)',
      'margin-top': '8px',
    });
    await expect(
      getComputedStyle(placeholder, '::after').backgroundImage,
    ).toContain('171, 205, 239');
  },
};
