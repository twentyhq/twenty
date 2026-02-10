import { type Meta, type StoryObj } from '@storybook/react-vite';

import { IconsProvider } from '@ui/display/icon/providers/IconsProvider';
import { ComponentDecorator } from '@ui/testing/decorators/ComponentDecorator';
import { RecoilRootDecorator } from '@ui/testing/decorators/RecoilRootDecorator';

import { Icon } from '../Icon';

const meta: Meta<typeof Icon> = {
  title: 'UI/Display/Icon/Icon',
  component: Icon,
  decorators: [
    ComponentDecorator,
    (Story) => (
      <IconsProvider>
        <Story />
      </IconsProvider>
    ),
    RecoilRootDecorator,
  ],
};

export default meta;
type Story = StoryObj<typeof Icon>;

export const Default: Story = {
  args: {
    name: 'IconUser',
  },
};

export const WithCustomSize: Story = {
  args: {
    name: 'IconSettings',
    size: 32,
  },
};

export const WithCustomColor: Story = {
  args: {
    name: 'IconHeart',
    color: 'red',
    size: 24,
  },
};

export const WithCustomStroke: Story = {
  args: {
    name: 'IconStar',
    size: 24,
    stroke: 1,
  },
};

export const InvalidName: Story = {
  args: {
    name: 'NonExistentIcon',
  },
};
