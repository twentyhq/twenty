import { type Meta, type StoryObj } from '@storybook/react';

import { ComponentDecorator } from '@ui/testing';
import { Banner } from '../Banner';

const meta: Meta<typeof Banner> = {
  title: 'UI/Layout/Banner/Banner',
  component: Banner,
  decorators: [ComponentDecorator],
  render: (args) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Banner {...args}>
      Sync lost with mailbox hello@twenty.com. Please reconnect for updates:
    </Banner>
  ),
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof Banner>;

export const Default: Story = {};
