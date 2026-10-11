import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Avatar } from '@ui/primitives/data-display/Avatar/Avatar';
import { Button } from '@ui/primitives/input/Button/Button';
import { ComponentDecorator } from '@ui/testing';

import { AvatarGroup } from '../AvatarGroup';
import { AvatarGroupIdentityExample } from './AvatarGroupIdentityExample';

const avatars = [
  'Matthew',
  'Sophie',
  'Jane',
  'Lily',
  'John',
  'Oliver',
  'Emma',
  'Noah',
].map((name) => <Avatar key={name} name={name} role="img" aria-label={name} />);

const onRootRef = fn();
const onRootClick = fn();
const onRootKeyDown = fn();

const meta: Meta<typeof AvatarGroup> = {
  id: 'ui-data-display-avatargroup-interactions',
  title: 'UI/Components/Data display/AvatarGroup/Interactions',
  component: AvatarGroup,
  tags: ['!autodocs'],
  decorators: [ComponentDecorator],
  args: { avatars, maxVisible: 3 },
  beforeEach: () => {
    onRootRef.mockClear();
    onRootClick.mockClear();
    onRootKeyDown.mockClear();
  },
};

export default meta;
type Story = StoryObj<typeof AvatarGroup>;

export const SuppliedAvatars: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('+5')).toBeVisible();

    for (const name of ['Matthew', 'Sophie', 'Jane']) {
      expect(canvas.getByLabelText(name)).toBeVisible();
    }

    expect(canvas.queryByLabelText('Lily')).not.toBeInTheDocument();
  },
};

export const PartiallyLoaded: Story = {
  args: { avatars: avatars.slice(0, 3), total: 20 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('+17')).toBeVisible();

    for (const name of ['Matthew', 'Sophie', 'Jane']) {
      expect(canvas.getByLabelText(name)).toBeVisible();
    }
  },
};

export const CustomOverflow: Story = {
  args: {
    avatars: avatars.slice(0, 3),
    total: 20,
    renderOverflow: (hiddenCount) => (
      <Button size="sm">Show {hiddenCount} more members</Button>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByRole('button', { name: 'Show 17 more members' }),
    ).toBeVisible();
    expect(canvas.queryByText('+17')).not.toBeInTheDocument();
    expect(canvas.getByLabelText('Jane')).toBeVisible();
  },
};

export const SurvivingChildIdentity: Story = {
  render: () => <AvatarGroupIdentityExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const sophie = canvas.getByRole('button', {
      name: 'Sophie selected 0 times',
    });

    await userEvent.click(sophie);
    expect(sophie).toHaveAccessibleName('Sophie selected 1 times');
    expect(sophie).toHaveFocus();

    for (const { key, hiddenCount, visibleCount } of [
      { key: 'r', hiddenCount: 0, visibleCount: 3 },
      { key: 'l', hiddenCount: 1, visibleCount: 2 },
      { key: 't', hiddenCount: 18, visibleCount: 2 },
      { key: 'l', hiddenCount: 17, visibleCount: 3 },
      { key: 't', hiddenCount: 0, visibleCount: 3 },
    ]) {
      await userEvent.keyboard(key);
      expect(
        canvas.getByRole('button', { name: 'Sophie selected 1 times' }),
      ).toBe(sophie);
      expect(sophie).toHaveFocus();
      expect(canvas.getAllByRole('button')).toHaveLength(visibleCount);
      expect(canvas.getAllByRole('button')[0]).toBe(sophie);

      if (hiddenCount > 0) {
        expect(canvas.getByText(`+${hiddenCount}`)).toBeVisible();
        continue;
      }

      expect(canvas.queryByText(/^\+/)).not.toBeInTheDocument();
    }
  },
};

export const NativeRootComposition: Story = {
  args: {
    ref: onRootRef,
    onClick: onRootClick,
    onKeyDown: onRootKeyDown,
    'aria-label': 'Team members',
    role: 'group',
    tabIndex: 0,
    title: 'Current team',
    lang: 'fr',
    render: <section data-team="sales" />,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvas.getByRole('group', { name: 'Team members' });

    expect(root.tagName).toBe('SECTION');
    expect(root).toHaveAttribute('title', 'Current team');
    expect(root).toHaveAttribute('lang', 'fr');
    expect(root).toHaveAttribute('data-team', 'sales');
    expect(onRootRef).toHaveBeenCalledWith(root);
    root.focus();
    await userEvent.keyboard('{Enter}');
    expect(root).toHaveFocus();
    expect(onRootKeyDown).toHaveBeenCalledOnce();
    expect(onRootClick).not.toHaveBeenCalled();
    await userEvent.click(root);
    expect(onRootClick).toHaveBeenCalledOnce();
  },
};
