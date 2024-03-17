import { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator } from '../../../../testing/decorators/ComponentDecorator';
import { Checkmark } from '../Checkmark';

const meta: Meta<typeof Checkmark> = {
  title: 'UI/Display/Checkmark/Checkmark',
  component: Checkmark,
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof Checkmark>;

export const Default: Story = { args: {} };
