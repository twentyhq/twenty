import { type Meta, type StoryObj } from '@storybook/react';
import { ComponentDecorator } from '@ui/testing';

import { Card } from '../Card';
import { CardContent } from '../CardContent';
import { CardFooter } from '../CardFooter';
import { CardHeader } from '../CardHeader';

const meta: Meta<typeof Card> = {
  title: 'UI/Layout/Card/Card',
  component: Card,
  decorators: [ComponentDecorator],
  render: (args) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
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
  argTypes: {
    as: { control: false },
    theme: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {};
