import { type Meta, type StoryObj } from '@storybook/react-vite';
import { ComponentDecorator } from '@ui/testing';

import { Card } from '@ui/primitives/surfaces/Card/Card';

const meta: Meta<typeof Card.Root> = {
  title: 'UI/Surfaces/Card',
  component: Card.Root,
  decorators: [ComponentDecorator],
  render: (args) => (
    <Card.Root {...args}>
      <Card.Header>Lorem ipsum</Card.Header>
      <Card.Content>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec id massa
        vel odio ullamcorper molestie eu nec ipsum. Sed semper convallis
        consectetur.
      </Card.Content>
      <Card.Footer>Lorem ipsum</Card.Footer>
    </Card.Root>
  ),
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof Card.Root>;

export const Default: Story = {};
