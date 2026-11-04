import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Text } from '@ui/primitives/typography/Text/Text';
import {
  CatalogDecorator,
  ComponentDecorator,
  type CatalogStory,
} from '@ui/testing';

import { AssistantAvatar } from '../AssistantAvatar';
import { ASSISTANT_AVATAR_COLORS } from '../internal/constants/assistantAvatarColors.constant';
import { type AssistantAvatarColor } from '../types/AssistantAvatarColor';
import { type AssistantAvatarFace } from '../types/AssistantAvatarFace';
import { type AssistantAvatarShape } from '../types/AssistantAvatarShape';
import { type AssistantAvatarSize } from '../types/AssistantAvatarSize';

const SHAPES = [
  'circle',
  'cookie',
  'cloud',
  'clover',
  'flower',
  'burst',
  'pill',
  'arch',
  'gem',
  'hexagon',
] as const;
const FACES = [
  'default',
  'happy',
  'wink',
  'surprised',
  'sleepy',
  'love',
] as const;
const SIZES = [14, 16, 20, 24, 40] as const;

const meta = {
  title: 'UI/Components/Data display/AssistantAvatar',
  component: AssistantAvatar,
  args: { shape: 'circle', face: 'default', color: 'blue', size: 24 },
  argTypes: {
    shape: { control: 'select', options: SHAPES },
    face: { control: 'select', options: FACES },
    color: { control: 'select', options: ASSISTANT_AVATAR_COLORS },
    size: { control: 'select', options: SIZES },
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
    catalog: {
      dimensions: [
        {
          name: 'face',
          values: [...FACES],
          props: (face: AssistantAvatarFace) => ({ face }),
        },
        {
          name: 'shape',
          values: [...SHAPES],
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
    catalog: {
      dimensions: [
        {
          name: 'size',
          values: [...SIZES],
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
      for (const size of SIZES) {
        const avatar = canvas.getByRole('img', { name: `${color} ${size}` });
        const bounds = avatar.getBoundingClientRect();
        const style = getComputedStyle(avatar);

        await expect(bounds.width).toBe(size);
        await expect(bounds.height).toBe(size);
        await expect(
          style.getPropertyValue('--assistant-avatar-body-color').trim(),
        ).toBe(style.getPropertyValue(`--t-color-${color}4`).trim());
        const usesBrightPalette = color === 'sky' || color === 'yellow';
        const faceShade = usesBrightPalette ? 11 : 10;

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
