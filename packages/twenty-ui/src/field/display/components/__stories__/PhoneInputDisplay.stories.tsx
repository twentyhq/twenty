import { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator } from 'src/testing/decorators/ComponentDecorator';
import { RouterDecorator } from 'src/testing/decorators/RouterDecorator';

import { PhoneDisplay } from '../PhoneDisplay'; // Adjust the import path as needed

const meta: Meta = {
  title: 'UI/Input/PhoneInputDisplay/PhoneInputDisplay',
  component: PhoneDisplay,
  decorators: [ComponentDecorator, RouterDecorator],
  args: {
    value: '+33788901234',
  },
};

export default meta;

type Story = StoryObj<typeof PhoneDisplay>;

export const Default: Story = {};
