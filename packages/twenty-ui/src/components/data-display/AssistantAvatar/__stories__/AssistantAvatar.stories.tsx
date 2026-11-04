import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

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
  args: { shape: 'circle', face: 'default', color: 'blue', size: 24 },
  argTypes: {
    shape: { control: 'select', options: ASSISTANT_AVATAR_SHAPES },
    face: { control: 'select', options: ASSISTANT_AVATAR_FACES },
    color: { control: 'select', options: ASSISTANT_AVATAR_COLORS },
    size: { control: 'select', options: ASSISTANT_AVATAR_SIZES },
  },
} satisfies Meta<typeof AssistantAvatar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Display: Story = {
  decorators: [ComponentDecorator],
  render: ({ shape, face, color, size }) => (
    <Text style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <AssistantAvatar shape={shape} face={face} color={color} size={size} />
      <Text>Workspace assistant</Text>
    </Text>
  ),
};

export const ShapesAndFaces: CatalogStory<Story, typeof AssistantAvatar> = {
  args: { color: 'blue', size: 40 },
  decorators: [CatalogDecorator],
  render: ({ shape, face, color, size }) => (
    <AssistantAvatar
      shape={shape}
      face={face}
      color={color}
      size={size}
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
  render: ({ shape, face, color, size }) => (
    <AssistantAvatar
      shape={shape}
      face={face}
      color={color}
      size={size}
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
