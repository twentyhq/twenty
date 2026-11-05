import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { Button } from '@ui/primitives/input/Button/Button';
import { Text } from '@ui/primitives/typography/Text/Text';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  ComponentDecorator,
  type CatalogStory,
} from '@ui/testing';

import { AssistantAvatar } from '../AssistantAvatar';
import { ASSISTANT_AVATAR_COLORS } from '../internal/constants/assistantAvatarColors.constant';
import { ASSISTANT_AVATAR_FACES } from '../internal/constants/assistantAvatarFaces.constant';
import { ASSISTANT_AVATAR_SHAPES } from '../internal/constants/assistantAvatarShapes.constant';
import { ASSISTANT_AVATAR_SIZES } from '../internal/constants/assistantAvatarSizes.constant';
import { type AssistantAvatarColor } from '../types/AssistantAvatarColor';
import { type AssistantAvatarFace } from '../types/AssistantAvatarFace';
import { type AssistantAvatarShape } from '../types/AssistantAvatarShape';
import { type AssistantAvatarSize } from '../types/AssistantAvatarSize';

const meta = {
  title: 'UI/Components/Data display/AssistantAvatar',
  component: AssistantAvatar,
  args: {
    shape: 'circle',
    face: 'default',
    color: 'blue',
    size: 24,
    isAnimated: false,
  },
  argTypes: {
    shape: { control: 'select', options: ASSISTANT_AVATAR_SHAPES },
    face: { control: 'select', options: ASSISTANT_AVATAR_FACES },
    color: { control: 'select', options: ASSISTANT_AVATAR_COLORS },
    size: { control: 'select', options: ASSISTANT_AVATAR_SIZES },
    isAnimated: { control: 'boolean' },
  },
} satisfies Meta<typeof AssistantAvatar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Display: Story = {
  decorators: [ComponentDecorator],
  render: ({ shape, face, color, size, isAnimated }) => (
    <Text style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <AssistantAvatar
        shape={shape}
        face={face}
        color={color}
        size={size}
        isAnimated={isAnimated}
      />
      <Text>Workspace assistant</Text>
    </Text>
  ),
};

export const ShapesAndFaces: CatalogStory<Story, typeof AssistantAvatar> = {
  args: { color: 'blue', size: 40 },
  decorators: [CatalogDecorator],
  render: ({ shape, face, color, size, isAnimated }) => (
    <AssistantAvatar
      shape={shape}
      face={face}
      color={color}
      size={size}
      isAnimated={isAnimated}
      aria-label={`${shape} ${face}`}
    />
  ),
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    catalog: {
      dimensions: [
        {
          name: 'face',
          values: [...ASSISTANT_AVATAR_FACES],
          props: (face: AssistantAvatarFace) => ({ face }),
        },
        {
          name: 'shape',
          values: [...ASSISTANT_AVATAR_SHAPES],
          props: (shape: AssistantAvatarShape) => ({ shape }),
        },
      ],
      options: { elementContainer: { width: 56 } },
    },
  },
};

export const ShapesAndFacesDark: typeof ShapesAndFaces = {
  ...ShapesAndFaces,
  tags: ['!autodocs'],
  globals: { colorScheme: 'dark' },
};

export const PaletteAndSizes: CatalogStory<Story, typeof AssistantAvatar> = {
  args: { shape: 'cloud', face: 'happy' },
  decorators: [CatalogDecorator],
  render: ({ shape, face, color, size, isAnimated }) => (
    <AssistantAvatar
      shape={shape}
      face={face}
      color={color}
      size={size}
      isAnimated={isAnimated}
      aria-label={`${color} ${size}`}
    />
  ),
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    catalog: {
      dimensions: [
        {
          name: 'size',
          values: [...ASSISTANT_AVATAR_SIZES],
          props: (size: AssistantAvatarSize) => ({ size }),
        },
        {
          name: 'color',
          values: [...ASSISTANT_AVATAR_COLORS],
          props: (color: AssistantAvatarColor) => ({ color }),
        },
      ],
      options: { elementContainer: { width: 56 } },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const color of ASSISTANT_AVATAR_COLORS) {
      for (const size of ASSISTANT_AVATAR_SIZES) {
        const avatar = canvas.getByRole('img', { name: `${color} ${size}` });
        const bounds = avatar.getBoundingClientRect();
        const style = getComputedStyle(avatar);

        await expect(bounds.width).toBe(size);
        await expect(bounds.height).toBe(size);
        await expect(
          style.getPropertyValue('--assistant-avatar-body-color').trim(),
        ).toBe(style.getPropertyValue(`--t-color-${color}4`).trim());
        const isBrightPalette = color === 'sky' || color === 'yellow';
        const faceShade = isBrightPalette ? 11 : 10;

        await expect(
          style.getPropertyValue('--assistant-avatar-face-color').trim(),
        ).toBe(style.getPropertyValue(`--t-color-${color}${faceShade}`).trim());
      }
    }
  },
};

export const PaletteAndSizesDark: typeof PaletteAndSizes = {
  ...PaletteAndSizes,
  tags: ['!autodocs'],
  globals: { colorScheme: 'dark' },
};

export const IdleFaces: CatalogStory<Story, typeof AssistantAvatar> = {
  args: { size: 40, isAnimated: true },
  decorators: [CatalogDecorator],
  render: ({ shape, face, color, size, isAnimated }) => (
    <AssistantAvatar
      shape={shape}
      face={face}
      color={color}
      size={size}
      isAnimated={isAnimated}
      aria-label={face}
    />
  ),
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    catalog: {
      dimensions: [
        {
          name: 'face',
          values: [...ASSISTANT_AVATAR_FACES],
          props: (face: AssistantAvatarFace) => ({ face }),
        },
      ],
      options: { elementContainer: { width: 56 } },
    },
  },
};

export const IdleFacesDark: typeof IdleFaces = {
  ...IdleFaces,
  tags: ['!autodocs'],
  globals: { colorScheme: 'dark' },
};

export const IdleMotion: typeof IdleFaces = {
  ...IdleFaces,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const isMotionEnabled = !window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    for (const face of ASSISTANT_AVATAR_FACES) {
      const avatar = canvas.getByRole('img', { name: face });

      await expect(avatar).toBeVisible();
      await expect(avatar.getAnimations({ subtree: true }).length > 0).toBe(
        isMotionEnabled,
      );
    }
  },
};

export const StaticFaces: typeof IdleFaces = {
  ...IdleFaces,
  args: { size: 40, isAnimated: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const face of ASSISTANT_AVATAR_FACES) {
      const avatar = canvas.getByRole('img', { name: face });

      await expect(avatar).toBeVisible();
      await expect(avatar.getAnimations({ subtree: true })).toHaveLength(0);
    }
  },
};

const ControlledAnimationExample = () => {
  const [isAnimated, setIsAnimated] = useState(false);

  return (
    <Text style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <AssistantAvatar
        face="wink"
        size={40}
        isAnimated={isAnimated}
        aria-label="Workspace assistant"
      />
      <Button onClick={() => setIsAnimated(!isAnimated)}>
        {isAnimated ? 'Stop animation' : 'Animate assistant'}
      </Button>
    </Text>
  );
};

export const ControlledAnimation: Story = {
  decorators: [ComponentDecorator],
  render: () => <ControlledAnimationExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const avatar = canvas.getByRole('img', { name: 'Workspace assistant' });
    const isMotionEnabled = !window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    await expect(avatar.getAnimations({ subtree: true })).toHaveLength(0);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Animate assistant' }),
    );
    await expect(avatar.getAnimations({ subtree: true }).length > 0).toBe(
      isMotionEnabled,
    );
    await expect(canvas.getAllByRole('img')).toHaveLength(1);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Stop animation' }),
    );
    await expect(avatar.getAnimations({ subtree: true })).toHaveLength(0);
    await expect(avatar).toHaveAttribute('data-face', 'wink');
  },
};
