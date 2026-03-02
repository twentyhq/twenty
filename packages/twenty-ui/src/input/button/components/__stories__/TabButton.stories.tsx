/* eslint-disable react/jsx-props-no-spreading */
import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import {
  IconCheckbox,
  IconChevronDown,
  IconMail,
  IconSearch,
  IconSettings,
  IconUser,
} from '@ui/display';
import { TabButton } from '@ui/input/button/components/TabButton/TabButton';
import {
  CatalogDecorator,
  type CatalogStory,
  ComponentWithRouterDecorator,
  JotaiRootDecorator,
} from '@ui/testing';
import { type ReactNode } from 'react';
import { themeCssVariables } from '@ui/theme';

const StyledTabContainer = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  height: 40px;
  user-select: none;
  position: relative;
  align-items: stretch;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background-color: ${themeCssVariables.border.color.light};
  }
`;

const TabContainer = ({ children }: { children?: ReactNode }) => {
  return <StyledTabContainer>{children}</StyledTabContainer>;
};

const meta: Meta<typeof TabButton> = {
  title: 'UI/Input/Button/TabButton',
  component: TabButton,
  decorators: [ComponentWithRouterDecorator, JotaiRootDecorator],
  args: {
    id: 'tab-button',
    title: 'Tab Title',
    active: false,
    disabled: false,
    contentSize: 'sm',
  },
  argTypes: {
    LeftIcon: { control: false },
    RightIcon: { control: false },
    pill: { control: 'text' },
    contentSize: {
      control: 'select',
      options: ['sm', 'md'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof TabButton>;

export const Default: Story = {
  args: {
    title: 'General',
    LeftIcon: IconSettings,
  },
  render: (args) => (
    <TabContainer>
      <TabButton {...args} />
    </TabContainer>
  ),
};

export const Active: Story = {
  args: {
    title: 'Active Tab',
    LeftIcon: IconUser,
    active: true,
  },
  render: (args) => (
    <TabContainer>
      <TabButton {...args} />
    </TabContainer>
  ),
};

export const Disabled: Story = {
  args: {
    title: 'Disabled Tab',
    LeftIcon: IconCheckbox,
    disabled: true,
  },
  render: (args) => (
    <TabContainer>
      <TabButton {...args} />
    </TabContainer>
  ),
};

export const WithLogo: Story = {
  args: {
    title: 'Company',
    logo: 'https://picsum.photos/192/192',
  },
  render: (args) => (
    <TabContainer>
      <TabButton {...args} />
    </TabContainer>
  ),
};

export const WithStringPill: Story = {
  args: {
    title: 'Messages',
    LeftIcon: IconMail,
    pill: '12',
  },
  render: (args) => (
    <TabContainer>
      <TabButton {...args} />
    </TabContainer>
  ),
};

export const WithBothIcons: Story = {
  args: {
    title: 'Search',
    LeftIcon: IconSearch,
    RightIcon: IconChevronDown,
  },
  render: (args) => (
    <TabContainer>
      <TabButton {...args} />
    </TabContainer>
  ),
};

export const AsLink: Story = {
  args: {
    title: 'Link Tab',
    LeftIcon: IconUser,
    to: '/profile',
  },
  render: (args) => (
    <TabContainer>
      <TabButton {...args} />
    </TabContainer>
  ),
};

export const SmallContent: Story = {
  args: {
    title: 'Small',
    LeftIcon: IconSettings,
    contentSize: 'sm',
  },
  render: (args) => (
    <TabContainer>
      <TabButton {...args} />
    </TabContainer>
  ),
};

export const MediumContent: Story = {
  args: {
    title: 'Medium',
    LeftIcon: IconSettings,
    contentSize: 'md',
  },
  render: (args) => (
    <TabContainer>
      <TabButton {...args} />
    </TabContainer>
  ),
};

export const Catalog: CatalogStory<Story, typeof TabButton> = {
  args: {
    title: 'Tab title',
    LeftIcon: IconCheckbox,
  },
  argTypes: {
    active: { control: false },
    disabled: { control: false },
    onClick: { control: false },
    to: { control: false },
  },
  render: (args) => (
    <TabContainer>
      <TabButton {...args} />
    </TabContainer>
  ),
  parameters: {
    pseudo: { hover: ['.hover'], active: ['.active'] },
    catalog: {
      dimensions: [
        {
          name: 'states',
          values: ['default', 'hover', 'active'],
          props: (state: string) =>
            state === 'default' ? {} : { className: state },
        },
        {
          name: 'State',
          values: ['active', 'inactive', 'disabled'],
          labels: (state: string) => state,
          props: (state: string) => ({
            active: state === 'active',
            disabled: state === 'disabled',
          }),
        },
        {
          name: 'Content Size',
          values: ['sm', 'md'],
          labels: (size: string) => size,
          props: (size: string) => ({ contentSize: size as 'sm' | 'md' }),
        },
        {
          name: 'Content',
          values: ['icon', 'logo', 'pill'],
          props: (content: string) => {
            switch (content) {
              case 'icon':
                return { LeftIcon: IconSettings };
              case 'logo':
                return {
                  logo: 'https://picsum.photos/192/192',
                  LeftIcon: undefined,
                };
              case 'pill':
                return { LeftIcon: IconMail, pill: '5' };
              default:
                return {};
            }
          },
        },
      ],
    },
    layout: 'centered',
    viewport: {
      defaultViewport: 'responsive',
    },
  },
  decorators: [CatalogDecorator],
};
