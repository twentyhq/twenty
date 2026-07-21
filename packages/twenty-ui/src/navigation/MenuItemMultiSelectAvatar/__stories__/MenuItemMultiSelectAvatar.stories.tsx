import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Avatar } from '@ui/data-display';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  AVATAR_URL_MOCK,
  CatalogDecorator,
  type CatalogDimension,
  type CatalogOptions,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';
import { MenuItemMultiSelectAvatar } from '@ui/navigation/MenuItemMultiSelectAvatar/MenuItemMultiSelectAvatar';

const meta: Meta<typeof MenuItemMultiSelectAvatar> = {
  title: 'UI/Navigation/Menu/MenuItem/MenuItemMultiSelectAvatar',
  component: MenuItemMultiSelectAvatar,
};

export default meta;

type Story = StoryObj<typeof MenuItemMultiSelectAvatar>;

export const Default: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: {
    text: 'First option',
    contextualText: 'Contextual text',
    avatar: <Avatar avatarUrl={AVATAR_URL_MOCK} placeholder="L" />,
  },
  decorators: [ComponentDecorator],
};

export const ClickingCheckboxSelectsOnce: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: {
    text: 'First option',
    selected: false,
    onSelectChange: fn(),
  },
  decorators: [ComponentDecorator],
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('checkbox'));

    await expect(args.onSelectChange).toHaveBeenCalledTimes(1);
    await expect(args.onSelectChange).toHaveBeenCalledWith(true);
  },
};

export const Catalog: CatalogStory<Story, typeof MenuItemMultiSelectAvatar> = {
  args: { text: 'Menu item' },
  argTypes: {
    className: { control: false },
  },
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    pseudo: { hover: ['.hover'], active: ['.pressed'], focus: ['.focus'] },
    catalog: {
      dimensions: [
        {
          name: 'withAvatar',
          values: [true, false],
          props: (withAvatar: boolean) => ({
            avatar: withAvatar ? (
              <Avatar avatarUrl={AVATAR_URL_MOCK} placeholder="L" />
            ) : (
              <Avatar avatarUrl="" placeholder="L" />
            ),
          }),
          labels: (withAvatar: boolean) =>
            withAvatar ? 'With avatar' : 'Without avatar',
        },
        {
          name: 'selected',
          values: [true, false],
          props: (selected: boolean) => ({ selected }),
          labels: (selected: boolean) =>
            selected ? 'Selected' : 'Not selected',
        },
        {
          name: 'states',
          values: ['default', 'hover'],
          props: (state: string) => {
            switch (state) {
              case 'default':
                return {};
              case 'hover':
                return { className: state };
              default:
                return {};
            }
          },
        },
      ] as CatalogDimension[],
      options: {
        elementContainer: {
          width: 200,
        },
      } as CatalogOptions,
    },
  },
  decorators: [CatalogDecorator],
};
