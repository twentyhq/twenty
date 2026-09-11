import { useState } from 'react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import {
  AVATAR_URL_MOCK,
  ComponentDecorator,
  CatalogDecorator,
  type CatalogStory,
  A11Y_DEFER_COLOR_CONTRAST,
} from '@ui/testing';

import { Avatar } from '@ui/data-display/Avatar/Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'UI/Data Display/Avatar',
  component: Avatar,
  args: {
    src: AVATAR_URL_MOCK,
    size: 'md',
    name: 'E',
    shape: 'circle',
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Rounded: Story = { decorators: [ComponentDecorator] };

export const Squared: Story = {
  decorators: [ComponentDecorator],
  args: { shape: 'square' },
};

export const NoAvatarPictureRounded: Story = {
  decorators: [ComponentDecorator],
  args: { src: '' },
};

export const NoAvatarPictureSquared: Story = {
  decorators: [ComponentDecorator],
  args: {
    ...NoAvatarPictureRounded.args,
    ...Squared.args,
  },
};

export const App: Story = {
  decorators: [ComponentDecorator],
  args: {
    shape: 'square',
    variant: 'outline',
    src: '',
    name: 'Acme',
    colorSeed: 'acme-app',
  },
};

export const ImageFailingToLoadFallsBackToPlaceholder: Story = {
  decorators: [ComponentDecorator],
  args: {
    src: 'data:image/png;base64,not-a-valid-image',
    name: 'Eldritch',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const placeholderChar = await canvas.findByText('E');

    await expect(placeholderChar).toBeVisible();
  },
};

export const NotClickable: Story = {
  decorators: [ComponentDecorator],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  },
};

const clickFromEnterKey = fn();

export const ClickableActivatesOnEnter: Story = {
  decorators: [ComponentDecorator],
  args: { name: 'Eldritch', onClick: clickFromEnterKey },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const avatar = await canvas.findByRole('button', { name: 'Eldritch' });
    await expect(avatar.tagName).toBe('BUTTON');

    avatar.focus();
    await userEvent.keyboard('{Enter}');

    await expect(clickFromEnterKey).toHaveBeenCalledTimes(1);
  },
};

const clickFromSpaceKey = fn();

export const ClickableActivatesOnSpace: Story = {
  decorators: [ComponentDecorator],
  args: { name: 'Eldritch', onClick: clickFromSpaceKey },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const avatar = await canvas.findByRole('button', { name: 'Eldritch' });

    avatar.focus();
    await userEvent.keyboard(' ');

    await expect(clickFromSpaceKey).toHaveBeenCalledTimes(1);
  },
};

export const ClickableWithoutPlaceholderIsStillLabelled: Story = {
  decorators: [ComponentDecorator],
  args: { name: '', onClick: fn() },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByRole('button', { name: 'Avatar' }),
    ).toBeVisible();
  },
};

export const Catalog: CatalogStory<Story, typeof Avatar> = {
  args: { src: undefined, name: 'Jane' },
  decorators: [CatalogDecorator],
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    catalog: {
      dimensions: [
        {
          name: 'size',
          values: ['xs', 'sm', 'md', 'lg', 'xl'],
          props: (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl') => ({ size }),
        },
        {
          name: 'shape',
          values: ['square', 'circle'],
          props: (shape: 'square' | 'circle') => ({ shape }),
        },
        {
          name: 'variant',
          values: ['soft', 'outline'],
          props: (variant: 'soft' | 'outline') => ({ variant }),
        },
      ],
      options: { elementContainer: { style: { width: 48 } } },
    },
  },
};

export const CatalogDark: typeof Catalog = {
  ...Catalog,
  tags: ['!autodocs'],
  globals: { colorScheme: 'dark' },
};

const VALID_IMAGE =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="blue"/></svg>',
  );
const INVALID_IMAGE = 'data:image/png;base64,invalid';

const ImageChangesExample = () => {
  const [src, setSrc] = useState<string | undefined>(VALID_IMAGE);
  return (
    <>
      <Avatar src={src} name="Jane" size="xl" />
      <button type="button" onClick={() => setSrc(INVALID_IMAGE)}>
        Break image
      </button>
      <button type="button" onClick={() => setSrc(VALID_IMAGE)}>
        Restore image
      </button>
      <button type="button" onClick={() => setSrc(undefined)}>
        Remove image
      </button>
    </>
  );
};

export const ImageChanges: Story = {
  decorators: [ComponentDecorator],
  render: () => <ImageChangesExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole('img', { name: 'Jane' }),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Break image' }));
    await expect(await canvas.findByText('J')).toBeVisible();
    await waitFor(() =>
      expect(canvas.queryByRole('img')).not.toBeInTheDocument(),
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Restore image' }),
    );
    await expect(
      await canvas.findByRole('img', { name: 'Jane' }),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Remove image' }));
    await expect(await canvas.findByText('J')).toBeVisible();
  },
};

export const Disabled: Story = {
  decorators: [ComponentDecorator],
  args: { name: 'Jane', src: undefined, disabled: true, onClick: fn() },
  play: async ({ canvasElement, args }) => {
    const avatar = within(canvasElement).getByRole('button', { name: 'Jane' });
    await expect(avatar).toBeDisabled();
    await userEvent.click(avatar);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
