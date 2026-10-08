import { type MouseEvent, useState } from 'react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import illustrationUserUrl from '@assets/icons/illustration-user.svg?url';

import {
  AVATAR_URL_MOCK,
  ComponentDecorator,
  CatalogDecorator,
  type CatalogStory,
  A11Y_DEFER_COLOR_CONTRAST,
} from '@ui/testing';

import { Avatar } from '@ui/primitives/data-display/Avatar/Avatar';
import { type AvatarProps } from '@ui/primitives/data-display/Avatar/types/AvatarProps';
import { type AvatarShape } from '@ui/primitives/data-display/Avatar/types/AvatarShape';
import { Button } from '@ui/primitives/input/Button/Button';
import { IconUser } from '@ui/icon';

const VALID_IMAGE = illustrationUserUrl;
const INVALID_IMAGE = 'data:image/png;base64,invalid';

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

export const IconTile: Story = {
  decorators: [ComponentDecorator],
  args: {
    src: undefined,
    shape: 'rounded-square',
    icon: <IconUser />,
    role: 'img',
    'aria-label': 'Workspace icon',
  },
};

export const IconTileInteraction: Story = {
  ...IconTile,
  play: async ({ canvasElement }) => {
    const iconTile = within(canvasElement).getByRole('img', {
      name: 'Workspace icon',
    });
    const computedStyle = getComputedStyle(iconTile);

    await expect(iconTile).toBeVisible();
    await expect(computedStyle.borderRadius).toBe(
      computedStyle.getPropertyValue('--t-border-radius-sm').trim(),
    );
  },
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

export const Parts: Story = {
  decorators: [ComponentDecorator],
  render: () => (
    <Avatar.Root name="Jane Doe" shape="circle" size="xl">
      <Avatar.Image src={VALID_IMAGE} alt="Jane Doe" decoding="async" />
      <Avatar.Fallback role="img" aria-label="Jane Doe">
        JD
      </Avatar.Fallback>
    </Avatar.Root>
  ),
};

export const PartsInteraction: Story = {
  ...Parts,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const image = await canvas.findByAltText('Jane Doe');

    await expect(image).toBeVisible();
    await expect(image).toHaveAttribute('decoding', 'async');
    await expect(canvas.queryByText('JD')).not.toBeInTheDocument();
  },
};

export const ImageFailingToLoadFallsBackToPlaceholder: Story = {
  decorators: [ComponentDecorator],
  args: { src: INVALID_IMAGE, name: 'Eldritch' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const fallback = await canvas.findByRole('img', { name: 'Eldritch' });

    await expect(fallback).toHaveTextContent('E');
    await expect(fallback).toBeVisible();
    await expect(canvas.queryByAltText('Eldritch')).not.toBeInTheDocument();
  },
};

export const OnClickKeepsPresentationalRoot: Story = {
  decorators: [ComponentDecorator],
  args: {
    src: undefined,
    name: 'Jane',
    onClick: fn(),
    ref: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const fallback = canvas.getByRole('img', { name: 'Jane' });
    const root = fallback.parentElement;

    await expect(root?.tagName).toBe('SPAN');
    await expect(root).not.toHaveAttribute('tabindex');
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
    await expect(args.ref).toHaveBeenCalledWith(root);
    await userEvent.click(fallback);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const ButtonComposition: Story = {
  decorators: [ComponentDecorator],
  args: {
    src: undefined,
    name: 'Jane',
    size: 'xl',
    imageProps: { alt: '' },
    render: <button type="button" />,
    'aria-label': "Open Jane's profile",
  },
};

export const ButtonKeyboardInteraction: Story = {
  ...ButtonComposition,
  args: { ...ButtonComposition.args, onClick: fn(), ref: fn() },
  play: async ({ canvasElement, args }) => {
    const avatar = within(canvasElement).getByRole('button', {
      name: "Open Jane's profile",
    });

    await expect(avatar.tagName).toBe('BUTTON');
    await expect(args.ref).toHaveBeenCalledWith(avatar);
    avatar.focus();
    await expect(avatar).toHaveFocus();
    await userEvent.keyboard('{Enter} ');
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};

export const DisabledButtonInteraction: Story = {
  ...ButtonComposition,
  args: {
    ...ButtonComposition.args,
    render: <button type="button" disabled />,
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const avatar = within(canvasElement).getByRole('button', {
      name: "Open Jane's profile",
    });

    await expect(avatar).toBeDisabled();
    await userEvent.click(avatar);
    avatar.focus();
    await expect(avatar).not.toHaveFocus();
    await userEvent.keyboard('{Enter} ');
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const LinkComposition: Story = {
  ...ButtonComposition,
  args: {
    ...ButtonComposition.args,
    render: <a href="#avatar-profile" aria-label="Open Jane's profile" />,
  },
};

export const LinkKeyboardInteraction: Story = {
  ...LinkComposition,
  args: {
    ...LinkComposition.args,
    onClick: fn((event: MouseEvent<HTMLSpanElement>) => event.preventDefault()),
    ref: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const avatar = within(canvasElement).getByRole('link', {
      name: "Open Jane's profile",
    });

    await expect(avatar.tagName).toBe('A');
    await expect(avatar).toHaveAttribute('href', '#avatar-profile');
    await expect(args.ref).toHaveBeenCalledWith(avatar);
    avatar.focus();
    await expect(avatar).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledOnce();
    await userEvent.keyboard(' ');
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const DecorativeImageInteraction: Story = {
  decorators: [ComponentDecorator],
  args: { src: VALID_IMAGE, name: 'Jane', imageProps: { alt: '' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('presentation')).toBeVisible();
    await expect(canvas.queryByRole('img')).not.toBeInTheDocument();
  },
};

const ImageChangesExample = (props: AvatarProps) => {
  const [src, setSrc] = useState<string | undefined>(VALID_IMAGE);

  return (
    <>
      <Avatar
        {...props}
        src={src}
        name="Jane"
        size="xl"
        render={<a href="#jane" aria-label="Jane" />}
        aria-label="Jane"
        imageProps={{ ...props.imageProps, alt: '' }}
      />
      <Button onClick={() => setSrc(INVALID_IMAGE)}>Break image</Button>
      <Button onClick={() => setSrc(VALID_IMAGE)}>Restore image</Button>
      <Button onClick={() => setSrc(undefined)}>Remove image</Button>
    </>
  );
};

export const ImageChanges: Story = {
  decorators: [ComponentDecorator],
  args: {
    ref: fn(),
    imageProps: { onLoadingStatusChange: fn(), ref: fn() },
    fallbackProps: { children: 'JD', ref: fn() },
  },
  render: (args) => <ImageChangesExample {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const image = await canvas.findByRole('presentation');
    const recordLink = canvas.getByRole('link', { name: 'Jane' });

    await expect(image).toBeVisible();
    await expect((image as HTMLImageElement).naturalWidth).toBeGreaterThan(0);
    await expect(args.imageProps?.ref).toHaveBeenCalledWith(image);
    await expect(args.imageProps?.onLoadingStatusChange).toHaveBeenCalledWith(
      'loaded',
    );
    await expect(args.ref).toHaveBeenCalledWith(recordLink);
    await userEvent.click(canvas.getByRole('button', { name: 'Break image' }));
    const fallback = await canvas.findByText('JD');
    await expect(fallback).toBeVisible();
    await expect(args.fallbackProps?.ref).toHaveBeenCalledWith(fallback);
    await expect(recordLink).toHaveAccessibleName('Jane');
    await expect(args.imageProps?.onLoadingStatusChange).toHaveBeenCalledWith(
      'error',
    );
    await waitFor(() =>
      expect(canvas.queryByRole('presentation')).not.toBeInTheDocument(),
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Restore image' }),
    );
    const restoredImage = await canvas.findByRole('presentation');
    await expect(restoredImage).toBeVisible();
    await expect(
      (restoredImage as HTMLImageElement).naturalWidth,
    ).toBeGreaterThan(0);
    await expect(canvas.queryByText('JD')).not.toBeInTheDocument();
    await expect(recordLink).toHaveAccessibleName('Jane');
    await userEvent.click(canvas.getByRole('button', { name: 'Remove image' }));
    await expect(await canvas.findByText('JD')).toBeVisible();
    await expect(recordLink).toHaveAccessibleName('Jane');
  },
};

export const MountedImageChanges: Story = {
  ...ImageChanges,
  args: {
    ...ImageChanges.args,
    imageProps: {
      keepMounted: true,
      loading: 'lazy',
      onLoadingStatusChange: fn(),
      ref: fn(),
    },
    fallbackProps: { children: 'JD', ref: fn() },
    ref: fn(),
  },
};

const FallbackDelayExample = () => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <>
      <Button onClick={() => setIsVisible(true)}>Show avatar</Button>
      {isVisible && (
        <Avatar.Root name="Jane Doe" size="xl">
          <Avatar.Fallback
            delay={300}
            render={<strong />}
            role="img"
            aria-label="Jane Doe"
          >
            JD
          </Avatar.Fallback>
        </Avatar.Root>
      )}
    </>
  );
};

export const FallbackDelayInteraction: Story = {
  decorators: [ComponentDecorator],
  render: () => <FallbackDelayExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Show avatar' }));
    await expect(canvas.queryByText('JD')).not.toBeInTheDocument();
    const fallback = await canvas.findByRole('img', { name: 'Jane Doe' });
    await expect(fallback).toBeVisible();
    await expect(fallback).toHaveTextContent('JD');
    await expect(fallback.tagName).toBe('STRONG');
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
          values: ['square', 'rounded-square', 'circle'],
          props: (shape: AvatarShape) => ({ shape }),
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
