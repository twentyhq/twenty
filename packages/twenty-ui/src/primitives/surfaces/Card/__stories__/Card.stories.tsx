import { type Meta, type StoryObj } from '@storybook/react-vite';
import { ComponentDecorator } from '@ui/testing';

import { Card } from '@ui/primitives/surfaces/Card/Card';
import { CardContent } from '@ui/primitives/surfaces/CardContent/CardContent';
import { CardFooter } from '@ui/primitives/surfaces/CardFooter/CardFooter';
import { CardHeader } from '@ui/primitives/surfaces/CardHeader/CardHeader';

const meta: Meta<typeof Card> = {
  title: 'UI/Surfaces/Card',
  component: Card,
  decorators: [ComponentDecorator],
  render: (args) => (
    <Card {...args}>
      <CardHeader>Lorem ipsum</CardHeader>
      <CardContent>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec id massa
        vel odio ullamcorper molestie eu nec ipsum. Sed semper convallis
        consectetur.
      </CardContent>
      <CardFooter>Lorem ipsum</CardFooter>
    </Card>
  ),
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {};
