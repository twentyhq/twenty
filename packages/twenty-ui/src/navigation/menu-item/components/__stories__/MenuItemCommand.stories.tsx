import { Meta, StoryObj } from '@storybook/react';

import { IconBell } from '@ui/display';
import {
  CatalogDecorator,
  CatalogStory,
  ComponentDecorator,
} from '@ui/testing';
import { MenuItemCommand } from '../MenuItemCommand';

const meta: Meta<typeof MenuItemCommand> = {
  title: 'UI/Navigation/MenuItem/MenuItemCommand',
  component: MenuItemCommand,
};

export default meta;

type Story = StoryObj<typeof MenuItemCommand>;

export const Default: Story = {
  args: {
    text: 'First option',
    firstHotKey: '⌘',
    secondHotKey: '1',
  },
  render: (props) => (
    <MenuItemCommand
      LeftIcon={props.LeftIcon}
      text={props.text}
      firstHotKey={props.firstHotKey}
      secondHotKey={props.secondHotKey}
      className={props.className}
      onClick={props.onClick}
      isSelected={false}
    ></MenuItemCommand>
  ),
  decorators: [ComponentDecorator],
};

export const Catalog: CatalogStory<Story, typeof MenuItemCommand> = {
  args: {
    text: 'Menu item',
    firstHotKey: '⌘',
    secondHotKey: '1',
  },
  argTypes: {
    className: { control: false },
  },
  parameters: {
    pseudo: { hover: ['.hover'] },
    catalog: {
      dimensions: [
        {
          name: 'withIcon',
          values: [true, false],
          props: (withIcon: boolean) => ({
            LeftIcon: withIcon ? IconBell : undefined,
          }),
          labels: (withIcon: boolean) =>
            withIcon ? 'With left icon' : 'Without left icon',
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
      ],
      options: {
        elementContainer: {
          width: 200,
        },
      },
    },
  },
  render: (props) => (
    <MenuItemCommand
      LeftIcon={props.LeftIcon}
      text={props.text}
      firstHotKey={props.firstHotKey}
      secondHotKey={props.secondHotKey}
      className={props.className}
      onClick={props.onClick}
      isSelected={false}
    ></MenuItemCommand>
  ),
  decorators: [CatalogDecorator],
};
